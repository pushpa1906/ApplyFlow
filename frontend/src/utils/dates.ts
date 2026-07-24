export function dateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}/${day}/${year}`;
}

export function parseDate(value: string): Date | null {
  if (!value) return null;

  // MM/DD/YYYY
  if (value.includes("/")) {
    const [month, day, year] = value.split("/").map(Number);

    return new Date(year, month - 1, day);
  }

  // YYYY-MM-DD
  if (value.includes("-")) {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);
  }

  return null;
}

export function isThisWeek(value: string): boolean {
  const date = parseDate(value);

  if (!date) return false;

  const now = new Date();

  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}