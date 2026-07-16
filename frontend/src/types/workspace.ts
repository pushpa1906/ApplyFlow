import type { ApplicationRow } from "./application";

export type WorkspaceMode = "welcome" | "demo" | "sheet" | "personal";
export type AppPage = "dashboard" | "applications" | "goals" | "settings";

export interface WorkspaceConfig {
  api_version: string;
  personal_available: boolean;
  service_account_email: string;
  applications_sheet_name: string;
}

export interface WorkspaceData {
  rows: ApplicationRow[];
  columns: string[];
  spreadsheet_name: string;
  last_sync: string;
}
