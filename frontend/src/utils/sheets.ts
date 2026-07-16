export function extractSpreadsheetId(value: string): string {
  return value.trim().match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] ?? value.trim();
}
