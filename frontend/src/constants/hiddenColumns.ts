export const HIDDEN_COLUMNS = [
  "__applyflow_id",
  "Application ID",
  "Company ID",
  "Recruiter ID",
  "Resume ID",
  "Cover Letter ID",
  "Application Last Updated",
  "Created At",
  "Updated At",
  "Internal ID",
  "Sync ID",
];

export function isHiddenColumn(column: string): boolean {
  const normalized = column.trim().toLowerCase();
  return (
    HIDDEN_COLUMNS.some((item) => item.toLowerCase() === normalized) ||
    normalized.startsWith("__") ||
    normalized.endsWith(" internal id")
  );
}
