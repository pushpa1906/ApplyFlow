import { useMemo } from "react";
import type { ApplicationFilter, ApplicationRow } from "../types/application";

export default function useFilters(
  rows: ApplicationRow[],
  search: string,
  filters: ApplicationFilter[],
  sortColumn: string,
  ascending: boolean,
): ApplicationRow[] {
  return useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = rows.filter((row) => {
      const matchesSearch =
        !query ||
        Object.entries(row).some(([key, value]) => {
          if (key === "__applyflow_id") return false;
          return String(value ?? "").toLowerCase().includes(query);
        });

      const matchesFilters = filters.every(
        (filter) => String(row[filter.type] ?? "") === filter.value,
      );

      return matchesSearch && matchesFilters;
    });

    return [...result].sort((first, second) => {
      const a = String(first[sortColumn] ?? "");
      const b = String(second[sortColumn] ?? "");
      const comparison = a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return ascending ? comparison : -comparison;
    });
  }, [rows, search, filters, sortColumn, ascending]);
}
