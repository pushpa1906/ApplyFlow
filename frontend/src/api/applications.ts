import request from "./client";
import type { ApplicationFormData, ApplicationRow } from "../types/application";

function query(spreadsheetId?: string, personal = false): string {
  return personal
    ? "?personal=true"
    : `?spreadsheet_id=${encodeURIComponent(spreadsheetId ?? "")}`;
}

function personalHeaders(personal: boolean, accessCode: string): Record<string, string> {
  return personal ? { "X-Access-Code": accessCode } : {};
}

export function createApplication(
  row: ApplicationFormData,
  spreadsheetId?: string,
  personal = false,
  accessCode = "",
): Promise<ApplicationRow> {
  return request<ApplicationRow>(`/applications/${query(spreadsheetId, personal)}`, {
    method: "POST",
    headers: personalHeaders(personal, accessCode),
    body: JSON.stringify({ row, spreadsheet_id: spreadsheetId }),
  });
}

export function updateApplication(
  id: string,
  row: ApplicationFormData,
  spreadsheetId?: string,
  personal = false,
  accessCode = "",
): Promise<ApplicationRow> {
  return request<ApplicationRow>(
    `/applications/${encodeURIComponent(id)}/${query(spreadsheetId, personal)}`,
    {
      method: "PUT",
      headers: personalHeaders(personal, accessCode),
      body: JSON.stringify({ row, spreadsheet_id: spreadsheetId }),
    },
  );
}

export function deleteApplication(
  id: string,
  spreadsheetId?: string,
  personal = false,
  accessCode = "",
): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(
    `/applications/${encodeURIComponent(id)}/${query(spreadsheetId, personal)}`,
    {
      method: "DELETE",
      headers: personalHeaders(personal, accessCode),
      body: JSON.stringify({ spreadsheet_id: spreadsheetId }),
    },
  );
}
