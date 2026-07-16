import request from "./client";
import type { ValidationResponse } from "../types/application";
import type { WorkspaceConfig, WorkspaceData } from "../types/workspace";

export function getWorkspaceConfig(): Promise<WorkspaceConfig> {
  return request<WorkspaceConfig>("/config/");
}

export function validateWorkspace(spreadsheetId: string): Promise<ValidationResponse> {
  return request<ValidationResponse>("/sheets/validate/", {
    method: "POST",
    body: JSON.stringify({ spreadsheet_id: spreadsheetId }),
  });
}

export function loadWorkspace(
  spreadsheetId?: string,
  personal = false,
  accessCode = "",
): Promise<WorkspaceData> {
  const query = personal
    ? "?personal=true"
    : `?spreadsheet_id=${encodeURIComponent(spreadsheetId ?? "")}`;

  return request<WorkspaceData>(`/applications/${query}`, {
    headers: personal ? { "X-Access-Code": accessCode } : {},
  });
}
