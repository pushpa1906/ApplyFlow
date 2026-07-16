export interface ApplicationRow {
  __applyflow_id: string;
  [column: string]: string;
}

export type ApplicationFormData = Record<string, string>;

export interface ApplicationFilter {
  type: string;
  value: string;
}

export interface ValidationResponse {
  name: string;
  columns: string[];
  count: number;
}
