import json, uuid
from datetime import datetime, timezone
from pathlib import Path
from django.conf import settings
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES=['https://www.googleapis.com/auth/spreadsheets']
ID_COL='__applyflow_id'

class SheetsError(Exception): pass

def credentials():
    try:
        if settings.GOOGLE_SERVICE_ACCOUNT_JSON:
            info=json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)
            return Credentials.from_service_account_info(info,scopes=SCOPES)
        if settings.GOOGLE_SERVICE_ACCOUNT_FILE:
            path=Path(settings.GOOGLE_SERVICE_ACCOUNT_FILE)
            if not path.is_absolute(): path=Path(settings.BASE_DIR)/path
            return Credentials.from_service_account_file(path,scopes=SCOPES)
    except Exception as exc: raise SheetsError(f'Invalid Google credentials: {exc}')
    raise SheetsError('Google service account credentials are not configured.')

def service(): return build('sheets','v4',credentials=credentials(),cache_discovery=False)

def service_email():
    try: return credentials().service_account_email
    except Exception: return ''

def _execute(call):
    try: return call.execute()
    except HttpError as exc:
        msg='Google Sheets request failed.'
        try: msg=json.loads(exc.content.decode()).get('error',{}).get('message',msg)
        except Exception: pass
        raise SheetsError(msg)

def metadata(spreadsheet_id):
    return _execute(service().spreadsheets().get(spreadsheetId=spreadsheet_id,fields='properties.title,sheets.properties'))

def ensure_sheet(spreadsheet_id):
    meta=metadata(spreadsheet_id); names=[s['properties']['title'] for s in meta.get('sheets',[])]
    if settings.APPLICATIONS_SHEET_NAME not in names:
        _execute(service().spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id,body={'requests':[{'addSheet':{'properties':{'title':settings.APPLICATIONS_SHEET_NAME}}}]}))
        _execute(service().spreadsheets().values().update(spreadsheetId=spreadsheet_id,range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1:E1",valueInputOption='RAW',body={'values':[[ID_COL,'Company','Role','Application Status','Applied Date']]}))

def read_rows(spreadsheet_id):
    ensure_sheet(spreadsheet_id)
    meta=metadata(spreadsheet_id)
    values=_execute(service().spreadsheets().values().get(spreadsheetId=spreadsheet_id,range=f"'{settings.APPLICATIONS_SHEET_NAME}'")).get('values',[])
    if not values:
        headers=[ID_COL,'Company','Role','Application Status','Applied Date']
        _execute(service().spreadsheets().values().update(spreadsheetId=spreadsheet_id,range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1:E1",valueInputOption='RAW',body={'values':[headers]}))
        values=[headers]
    headers=[str(x).strip() for x in values[0]]
    if ID_COL not in headers:
        headers=[ID_COL]+headers
        updated=[headers]
        for row in values[1:]: updated.append([str(uuid.uuid4())]+row)
        _execute(service().spreadsheets().values().clear(spreadsheetId=spreadsheet_id,range=f"'{settings.APPLICATIONS_SHEET_NAME}'",body={}))
        _execute(service().spreadsheets().values().update(spreadsheetId=spreadsheet_id,range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1",valueInputOption='RAW',body={'values':updated}))
        values=updated
    rows=[]
    dirty=False
    for i,row in enumerate(values[1:],start=2):
        padded=list(row)+['']*(len(headers)-len(row))
        item={headers[j]:str(padded[j]) for j in range(len(headers))}
        if not item.get(ID_COL): item[ID_COL]=str(uuid.uuid4());dirty=True
        rows.append(item)
    if dirty: write_all(spreadsheet_id,headers,rows)
    return {'rows':rows,'columns':headers,'spreadsheet_name':meta['properties']['title'],'last_sync':datetime.now(timezone.utc).isoformat()}

def write_all(spreadsheet_id,headers,rows):
    matrix=[headers]+[[r.get(h,'') for h in headers] for r in rows]
    _execute(service().spreadsheets().values().clear(spreadsheetId=spreadsheet_id,range=f"'{settings.APPLICATIONS_SHEET_NAME}'",body={}))
    _execute(service().spreadsheets().values().update(spreadsheetId=spreadsheet_id,range=f"'{settings.APPLICATIONS_SHEET_NAME}'!A1",valueInputOption='USER_ENTERED',body={'values':matrix}))

def create_row(spreadsheet_id,row):
    data=read_rows(spreadsheet_id);headers=data['columns']
    for key in row:
        if key not in headers and key!=ID_COL: headers.append(key)
    item={h:'' for h in headers};item.update({k:str(v) for k,v in row.items()});item[ID_COL]=str(uuid.uuid4())
    write_all(spreadsheet_id,headers,[item]+data['rows'])
    return item

def update_row(spreadsheet_id,row_id,row):
    data=read_rows(spreadsheet_id);headers=data['columns']
    for key in row:
        if key not in headers and key!=ID_COL: headers.append(key)
    found=False;out=[];saved=None
    for item in data['rows']:
        if item.get(ID_COL)==row_id:
            item={**item,**{k:str(v) for k,v in row.items()},ID_COL:row_id};saved=item;found=True
        out.append(item)
    if not found: raise SheetsError('Application row was not found. Sync and try again.')
    write_all(spreadsheet_id,headers,out);return saved

def delete_row(spreadsheet_id,row_id):
    data=read_rows(spreadsheet_id);out=[r for r in data['rows'] if r.get(ID_COL)!=row_id]
    if len(out)==len(data['rows']): raise SheetsError('Application row was not found.')
    write_all(spreadsheet_id,data['columns'],out)
