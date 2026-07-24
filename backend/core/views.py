from django.conf import settings
from rest_framework.decorators import api_view # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from . import sheets

def fail(exc,code=status.HTTP_400_BAD_REQUEST): return Response({'detail':str(exc)},status=code)
def personal_ok(request): return bool(settings.PERSONAL_ACCESS_CODE) and request.headers.get('X-Access-Code','')==settings.PERSONAL_ACCESS_CODE
def resolve_sheet(request,payload=None):
    payload=payload or {}
    personal=str(request.query_params.get('personal',payload.get('personal',''))).lower() in ('1','true','yes')
    if personal:
        if not personal_ok(request): raise sheets.SheetsError('Invalid personal access code.')
        if not settings.PERSONAL_SPREADSHEET_ID: raise sheets.SheetsError('Personal spreadsheet is not configured.')
        return settings.PERSONAL_SPREADSHEET_ID
    sid=payload.get('spreadsheet_id') or request.query_params.get('spreadsheet_id','')
    if not sid: raise sheets.SheetsError('Spreadsheet ID is required.')
    return sid

@api_view(['GET'])
def config_view(request):
    try:
        email = sheets.service_email()
    except Exception as e:
        email = f"ERROR: {e}"

    return Response({
        "api_version": "1.0",
        "personal_available": bool(
            settings.PERSONAL_SPREADSHEET_ID
            and settings.PERSONAL_ACCESS_CODE
        ),
        "service_account_email": email,
        "applications_sheet_name": settings.APPLICATIONS_SHEET_NAME,
    })

@api_view(['POST'])
def validate_sheet(request):
    try:
        sid=request.data.get('spreadsheet_id','').strip()
        if not sid: raise sheets.SheetsError('Spreadsheet ID is required.')
        data=sheets.read_rows(sid)
        return Response({'name':data['spreadsheet_name'],'columns':data['columns'],'count':len(data['rows'])})
    except Exception as exc: return fail(exc)

@api_view(['GET','POST'])
def applications(request):
    try:
        sid=resolve_sheet(request,request.data)
        if request.method=='GET': return Response(sheets.read_rows(sid))
        row=request.data.get('row') or {}
        for field in ('Company','Role','Application Status','Applied Date'):
            if not str(row.get(field,'')).strip(): raise sheets.SheetsError(f'{field} is required.')
        return Response(sheets.create_row(sid,row),status=status.HTTP_201_CREATED)
    except Exception as exc: return fail(exc)  

@api_view(['PUT','DELETE'])
def application_detail(request,row_id):
    try:
        sid=resolve_sheet(request,request.data)
        if request.method=='PUT': return Response(sheets.update_row(sid,row_id,request.data.get('row') or {}))
        sheets.delete_row(sid,row_id);return Response({'deleted':True})
    except Exception as exc: return fail(exc)

@api_view(['GET'])
def health(request): return Response({'status':'ok','api_version':'1.0'})
