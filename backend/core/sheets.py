import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from django.conf import settings
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import Resource, build
from googleapiclient.errors import HttpError


SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
ID_COL = "__applyflow_id"
DEFAULT_HEADERS = [
    ID_COL,
    "Company",
    "Role",
    "Application Status",
    "Applied Date",
]


class SheetsError(Exception):
    pass


def credentials() -> Credentials:
    try:
        if settings.GOOGLE_SERVICE_ACCOUNT_JSON:
            info = json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)
            return Credentials.from_service_account_info(info, scopes=SCOPES)

        if settings.GOOGLE_SERVICE_ACCOUNT_FILE:
            path = Path(settings.GOOGLE_SERVICE_ACCOUNT_FILE)
            if not path.is_absolute():
                path = Path(settings.BASE_DIR) / path
            return Credentials.from_service_account_file(path, scopes=SCOPES)

    except Exception as exc:
        raise SheetsError(f"Invalid Google credentials: {exc}") from exc

    raise SheetsError("Google service account credentials are not configured.")


def create_service() -> Resource:
    return build(
        "sheets",
        "v4",
        credentials=credentials(),
        cache_discovery=False,
    )


def close_service(api: Resource | None) -> None:
    if api is None:
        return
    try:
        api.close()
    except Exception:
        pass


def service_email() -> str:
    try:
        return credentials().service_account_email or ""
    except Exception:
        return ""


def _execute(call: Any) -> dict[str, Any]:
    try:
        return call.execute()
    except HttpError as exc:
        message = "Google Sheets request failed."
        try:
            content = json.loads(exc.content.decode())
            message = content.get("error", {}).get("message", message)
        except Exception:
            pass
        raise SheetsError(message) from exc


def metadata(api: Resource, spreadsheet_id: str) -> dict[str, Any]:
    return _execute(
        api.spreadsheets().get(
            spreadsheetId=spreadsheet_id,
            fields="properties.title,sheets.properties",
        )
    )


def _sheet_properties(meta: dict[str, Any]) -> dict[str, Any] | None:
    for sheet in meta.get("sheets", []):
        props = sheet.get("properties", {})
        if props.get("title") == settings.APPLICATIONS_SHEET_NAME:
            return props
    return None


def ensure_sheet(
    api: Resource,
    spreadsheet_id: str,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    meta = meta or metadata(api, spreadsheet_id)
    if _sheet_properties(meta):
        return meta

    _execute(
        api.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={
                "requests": [
                    {
                        "addSheet": {
                            "properties": {
                                "title": settings.APPLICATIONS_SHEET_NAME
                            }
                        }
                    }
                ]
            },
        )
    )

    _execute(
        api.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1:E1",
            valueInputOption="RAW",
            body={"values": [DEFAULT_HEADERS]},
        )
    )

    return metadata(api, spreadsheet_id)


def _column_letter(index: int) -> str:
    """Convert a zero-based column index to an A1 column label."""
    result = ""
    value = index + 1
    while value:
        value, remainder = divmod(value - 1, 26)
        result = chr(65 + remainder) + result
    return result


def _add_id_column_safely(
    api: Resource,
    spreadsheet_id: str,
    meta: dict[str, Any],
    existing_row_count: int,
) -> None:
    """Insert the internal ID column without clearing or rewriting user data."""
    props = _sheet_properties(meta)
    if not props:
        raise SheetsError("Applications sheet was not found.")

    _execute(
        api.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={
                "requests": [
                    {
                        "insertDimension": {
                            "range": {
                                "sheetId": props["sheetId"],
                                "dimension": "COLUMNS",
                                "startIndex": 0,
                                "endIndex": 1,
                            },
                            "inheritFromBefore": False,
                        }
                    }
                ]
            },
        )
    )

    values = [[ID_COL]]
    values.extend([[str(uuid.uuid4())] for _ in range(max(0, existing_row_count - 1))])
    end_row = max(1, existing_row_count)

    _execute(
        api.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1:A{end_row}",
            valueInputOption="RAW",
            body={"values": values},
        )
    )


def _fill_missing_ids(
    api: Resource,
    spreadsheet_id: str,
    headers: list[str],
    values: list[list[Any]],
) -> bool:
    id_index = headers.index(ID_COL)
    id_column = _column_letter(id_index)
    updates = []

    for offset, row in enumerate(values[1:], start=2):
        current = str(row[id_index]).strip() if id_index < len(row) else ""

        if not current:
            updates.append(
                {
                    "range": f"'{settings.APPLICATIONS_SHEET_NAME}'!{id_column}{offset}",
                    "values": [[str(uuid.uuid4())]],
                }
            )

    if not updates:
        return False

    _execute(
        api.spreadsheets().values().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={
                "valueInputOption": "RAW",
                "data": updates,
            },
        )
    )

    return True


def _read_rows(api: Resource, spreadsheet_id: str) -> dict[str, Any]:
    meta = ensure_sheet(
        api,
        spreadsheet_id,
        metadata(api, spreadsheet_id),
    )

    response = _execute(
        api.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=f"'{settings.APPLICATIONS_SHEET_NAME}'",
        )
    )

    values = response.get("values", [])

    # If the sheet is completely empty, create the default headers.
    if not values:
        _execute(
            api.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1:E1",
                valueInputOption="RAW",
                body={"values": [DEFAULT_HEADERS]},
            )
        )

        values = [DEFAULT_HEADERS]

    # Headers always exist from this point onward.
    headers = [
        str(value).strip()
        for value in values[0]
    ]

    # -----------------------------------------------------
    # Ensure the internal ApplyFlow ID column exists.
    # -----------------------------------------------------
    if ID_COL not in headers:
        _add_id_column_safely(
            api,
            spreadsheet_id,
            meta,
            len(values),
        )

        # Re-read because inserting the column changed the sheet.
        response = _execute(
            api.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=f"'{settings.APPLICATIONS_SHEET_NAME}'",
            )
        )

        values = response.get(
            "values",
            [DEFAULT_HEADERS],
        )

        headers = [
            str(value).strip()
            for value in values[0]
        ]

    # -----------------------------------------------------
    # The ID column now exists.
    # Fill any individual rows that have a missing ID.
    # -----------------------------------------------------
    ids_added = _fill_missing_ids(
        api,
        spreadsheet_id,
        headers,
        values,
    )

    # If IDs were written, re-read the sheet so the returned
    # rows contain those new IDs.
    if ids_added:
        response = _execute(
            api.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=f"'{settings.APPLICATIONS_SHEET_NAME}'",
            )
        )

        values = response.get(
            "values",
            [headers],
        )

        headers = [
            str(value).strip()
            for value in values[0]
        ]

    # -----------------------------------------------------
    # Convert Google Sheet rows into ApplyFlow row objects.
    # -----------------------------------------------------
    rows: list[dict[str, str]] = []

    for sheet_row, row in enumerate(
        values[1:],
        start=2,
    ):
        padded = list(row) + [""] * (
            len(headers) - len(row)
        )

        item = {
            headers[index]: str(padded[index])
            for index in range(len(headers))
        }

        item["__sheet_row"] = str(sheet_row)

        rows.append(item)

    return {
        "rows": rows,
        "columns": headers,
        "spreadsheet_name": meta["properties"]["title"],
        "last_sync": datetime.now(timezone.utc).isoformat(),
    }


def read_rows(spreadsheet_id: str) -> dict[str, Any]:
    api = None
    try:
        api = create_service()
        data = _read_rows(api, spreadsheet_id)
        for row in data["rows"]:
            row.pop("__sheet_row", None)
        return data
    finally:
        close_service(api)


def _ensure_headers(
    api: Resource,
    spreadsheet_id: str,
    headers: list[str],
    incoming: dict[str, Any],
) -> list[str]:
    new_headers = list(headers)
    for key in incoming:
        if key != ID_COL and key not in new_headers:
            new_headers.append(key)

    if new_headers != headers:
        start = len(headers)
        end = len(new_headers) - 1
        start_col = _column_letter(start)
        end_col = _column_letter(end)
        _execute(
            api.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"'{settings.APPLICATIONS_SHEET_NAME}'!{start_col}1:{end_col}1",
                valueInputOption="RAW",
                body={"values": [new_headers[start:]]},
            )
        )

    return new_headers


def create_row(spreadsheet_id: str, row: dict[str, Any]) -> dict[str, str]:
    api = None
    try:
        api = create_service()
        data = _read_rows(api, spreadsheet_id)
        headers = _ensure_headers(api, spreadsheet_id, list(data["columns"]), row)

        item = {header: "" for header in headers}
        item.update({key: str(value) for key, value in row.items() if key != ID_COL})
        item[ID_COL] = str(uuid.uuid4())

        _execute(
            api.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A:A",
                valueInputOption="USER_ENTERED",
                insertDataOption="INSERT_ROWS",
                body={"values": [[item.get(header, "") for header in headers]]},
            )
        )
        return item
    finally:
        close_service(api)

def _find_row_by_id(
    api: Resource,
    spreadsheet_id: str,
    row_id: str,
) -> tuple[list[str], dict[str, str], int]:
    response = _execute(
        api.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=f"'{settings.APPLICATIONS_SHEET_NAME}'",
        )
    )

    values = response.get("values", [])

    if not values:
        raise SheetsError("Applications sheet is empty.")

    headers = [str(value).strip() for value in values[0]]

    if ID_COL not in headers:
        raise SheetsError("Applications sheet is missing the ID column.")

    id_index = headers.index(ID_COL)

    for sheet_row, values_row in enumerate(values[1:], start=2):
        current_id = (
            str(values_row[id_index]).strip()
            if id_index < len(values_row)
            else ""
        )

        if current_id != row_id:
            continue

        item = {
            header: (
                str(values_row[index])
                if index < len(values_row)
                else ""
            )
            for index, header in enumerate(headers)
        }

        return headers, item, sheet_row

    raise SheetsError(
        "Application row was not found. Sync and try again."
    )


def update_row(
    spreadsheet_id: str,
    row_id: str,
    row: dict[str, Any],
) -> dict[str, str]:
    api = None

    try:
        api = create_service()

        headers, target, sheet_row = _find_row_by_id(
            api,
            spreadsheet_id,
            row_id,
        )

        headers = _ensure_headers(
            api,
            spreadsheet_id,
            headers,
            row,
        )

        saved = dict(target)

        updates = []

        for key, value in row.items():
            if key == ID_COL:
                continue

            saved[key] = str(value)

            column_index = headers.index(key)
            column = _column_letter(column_index)

            updates.append(
                {
                    "range": (
                        f"'{settings.APPLICATIONS_SHEET_NAME}'!"
                        f"{column}{sheet_row}"
                    ),
                    "values": [[str(value)]],
                }
            )

        if updates:
            _execute(
                api.spreadsheets().values().batchUpdate(
                    spreadsheetId=spreadsheet_id,
                    body={
                        "valueInputOption": "USER_ENTERED",
                        "data": updates,
                    },
                )
            )

        saved[ID_COL] = row_id

        return saved

    finally:
        close_service(api)

def delete_row(spreadsheet_id: str, row_id: str) -> None:
    api = None

    try:
        api = create_service()

        # Find only the application row we need to delete.
        _, _, sheet_row = _find_row_by_id(
            api,
            spreadsheet_id,
            row_id,
        )

        meta = metadata(api, spreadsheet_id)
        props = _sheet_properties(meta)

        if not props:
            raise SheetsError("Applications sheet was not found.")

        _execute(
            api.spreadsheets().batchUpdate(
                spreadsheetId=spreadsheet_id,
                body={
                    "requests": [
                        {
                            "deleteDimension": {
                                "range": {
                                    "sheetId": props["sheetId"],
                                    "dimension": "ROWS",
                                    "startIndex": sheet_row - 1,
                                    "endIndex": sheet_row,
                                }
                            }
                        }
                    ]
                },
            )
        )

    finally:
        close_service(api)