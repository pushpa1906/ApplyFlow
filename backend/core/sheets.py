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


class SheetsError(Exception):
    pass


def credentials() -> Credentials:
    try:
        if settings.GOOGLE_SERVICE_ACCOUNT_JSON:
            info = json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)

            return Credentials.from_service_account_info(
                info,
                scopes=SCOPES,
            )

        if settings.GOOGLE_SERVICE_ACCOUNT_FILE:
            path = Path(settings.GOOGLE_SERVICE_ACCOUNT_FILE)

            if not path.is_absolute():
                path = Path(settings.BASE_DIR) / path

            return Credentials.from_service_account_file(
                path,
                scopes=SCOPES,
            )

    except Exception as exc:
        raise SheetsError(
            f"Invalid Google credentials: {exc}"
        ) from exc

    raise SheetsError(
        "Google service account credentials are not configured."
    )


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
        # Closing should never hide the original Sheets operation result.
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
            message = content.get("error", {}).get(
                "message",
                message,
            )
        except Exception:
            pass

        raise SheetsError(message) from exc


def metadata(
    api: Resource,
    spreadsheet_id: str,
) -> dict[str, Any]:
    return _execute(
        api.spreadsheets().get(
            spreadsheetId=spreadsheet_id,
            fields="properties.title,sheets.properties",
        )
    )


def ensure_sheet(
    api: Resource,
    spreadsheet_id: str,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    meta = meta or metadata(api, spreadsheet_id)

    names = [
        sheet["properties"]["title"]
        for sheet in meta.get("sheets", [])
    ]

    if settings.APPLICATIONS_SHEET_NAME in names:
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

    headers = [
        ID_COL,
        "Company",
        "Role",
        "Application Status",
        "Applied Date",
    ]

    _execute(
        api.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=(
                f"'{settings.APPLICATIONS_SHEET_NAME}'!"
                f"A1:E1"
            ),
            valueInputOption="RAW",
            body={"values": [headers]},
        )
    )

    return meta


def _write_all(
    api: Resource,
    spreadsheet_id: str,
    headers: list[str],
    rows: list[dict[str, str]],
) -> None:
    matrix = [headers]

    matrix.extend(
        [
            [row.get(header, "") for header in headers]
            for row in rows
        ]
    )

    _execute(
        api.spreadsheets().values().clear(
            spreadsheetId=spreadsheet_id,
            range=f"'{settings.APPLICATIONS_SHEET_NAME}'",
            body={},
        )
    )

    _execute(
        api.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1",
            valueInputOption="USER_ENTERED",
            body={"values": matrix},
        )
    )


def _read_rows(
    api: Resource,
    spreadsheet_id: str,
) -> dict[str, Any]:
    meta = metadata(api, spreadsheet_id)
    ensure_sheet(api, spreadsheet_id, meta)

    response = _execute(
        api.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=f"'{settings.APPLICATIONS_SHEET_NAME}'",
        )
    )

    values = response.get("values", [])

    if not values:
        headers = [
            ID_COL,
            "Company",
            "Role",
            "Application Status",
            "Applied Date",
        ]

        _execute(
            api.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=(
                    f"'{settings.APPLICATIONS_SHEET_NAME}'!"
                    f"A1:E1"
                ),
                valueInputOption="RAW",
                body={"values": [headers]},
            )
        )

        values = [headers]

    headers = [
        str(value).strip()
        for value in values[0]
    ]

    if ID_COL not in headers:
        headers = [ID_COL, *headers]

        updated = [headers]

        for row in values[1:]:
            updated.append(
                [str(uuid.uuid4()), *row]
            )

        _execute(
            api.spreadsheets().values().clear(
                spreadsheetId=spreadsheet_id,
                range=f"'{settings.APPLICATIONS_SHEET_NAME}'",
                body={},
            )
        )

        _execute(
            api.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1",
                valueInputOption="RAW",
                body={"values": updated},
            )
        )

        values = updated

    rows: list[dict[str, str]] = []
    dirty = False

    for row in values[1:]:
        padded = list(row) + [""] * (
            len(headers) - len(row)
        )

        item = {
            headers[index]: str(padded[index])
            for index in range(len(headers))
        }

        if not item.get(ID_COL):
            item[ID_COL] = str(uuid.uuid4())
            dirty = True

        rows.append(item)

    if dirty:
        _write_all(
            api,
            spreadsheet_id,
            headers,
            rows,
        )

    return {
        "rows": rows,
        "columns": headers,
        "spreadsheet_name": meta["properties"]["title"],
        "last_sync": datetime.now(
            timezone.utc
        ).isoformat(),
    }


def read_rows(
    spreadsheet_id: str,
) -> dict[str, Any]:
    api = None

    try:
        api = create_service()
        return _read_rows(api, spreadsheet_id)

    finally:
        close_service(api)


def create_row(
    spreadsheet_id: str,
    row: dict[str, Any],
) -> dict[str, str]:
    api = None

    try:
        api = create_service()
        data = _read_rows(api, spreadsheet_id)

        headers = list(data["columns"])

        for key in row:
            if key not in headers and key != ID_COL:
                headers.append(key)

        item = {
            header: ""
            for header in headers
        }

        item.update(
            {
                key: str(value)
                for key, value in row.items()
            }
        )

        item[ID_COL] = str(uuid.uuid4())

        _write_all(
            api,
            spreadsheet_id,
            headers,
            [item, *data["rows"]],
        )

        return item

    finally:
        close_service(api)


def update_row(
    spreadsheet_id: str,
    row_id: str,
    row: dict[str, Any],
) -> dict[str, str]:
    api = None

    try:
        api = create_service()
        data = _read_rows(api, spreadsheet_id)

        headers = list(data["columns"])

        for key in row:
            if key not in headers and key != ID_COL:
                headers.append(key)

        found = False
        output: list[dict[str, str]] = []
        saved: dict[str, str] | None = None

        for item in data["rows"]:
            if item.get(ID_COL) == row_id:
                item = {
                    **item,
                    **{
                        key: str(value)
                        for key, value in row.items()
                    },
                    ID_COL: row_id,
                }

                saved = item
                found = True

            output.append(item)

        if not found or saved is None:
            raise SheetsError(
                "Application row was not found. "
                "Sync and try again."
            )

        _write_all(
            api,
            spreadsheet_id,
            headers,
            output,
        )

        return saved

    finally:
        close_service(api)


def delete_row(
    spreadsheet_id: str,
    row_id: str,
) -> None:
    api = None

    try:
        api = create_service()
        data = _read_rows(api, spreadsheet_id)

        output = [
            row
            for row in data["rows"]
            if row.get(ID_COL) != row_id
        ]

        if len(output) == len(data["rows"]):
            raise SheetsError(
                "Application row was not found."
            )

        _write_all(
            api,
            spreadsheet_id,
            data["columns"],
            output,
        )

    finally:
        close_service(api)