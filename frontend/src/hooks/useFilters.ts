import { useMemo } from "react";

import type {
  ApplicationFilter,
  ApplicationRow,
} from "../types/application";

import {
  isFollowUpOverdue,
  isFollowUpToday,
  isFollowUpUpcoming,
} from "../utils/followUps";

export default function useFilters(
  rows: ApplicationRow[],
  search: string,
  filters: ApplicationFilter[],
  sortColumn: string,
  ascending: boolean,
): ApplicationRow[] {
  return useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const result = rows.filter(
      (row) => {
        const matchesSearch =
          !query ||
          Object.entries(row).some(
            ([key, value]) => {
              if (
                key ===
                "__applyflow_id"
              ) {
                return false;
              }

              return String(
                value ?? "",
              )
                .toLowerCase()
                .includes(query);
            },
          );

        const matchesFilters =
          filters.every((filter) => {
            /* Smart Follow Up filters. These values are calculated.They do not need to exist inside the Google Sheet.*/
            if (
              filter.type ===
              "Follow Up Date"
            ) {
              const followUpDate =
                String(
                  row[
                    "Follow Up Date"
                  ] ?? "",
                );

              const status =
                String(
                  row[
                    "Application Status"
                  ] ?? "",
                );

              if (
                filter.value ===
                "Today"
              ) {
                return isFollowUpToday(
                  followUpDate,
                  status,
                );
              }

              if (
                filter.value ===
                "Upcoming"
              ) {
                return isFollowUpUpcoming(
                  followUpDate,
                  status,
                );
              }

              if (
                filter.value ===
                "Overdue"
              ) {
                return isFollowUpOverdue(
                  followUpDate,
                  status,
                );
              }

              /* If it isn't one of the smart values, compare the actual Follow Up Date.*/
              return (
                followUpDate ===
                filter.value
              );
            }

            /* Normal column filters*/
            return (
              String(
                row[
                  filter.type
                ] ?? "",
              ) === filter.value
            );
          });

        return (
          matchesSearch &&
          matchesFilters
        );
      },
    );

    return [...result].sort(
      (first, second) => {
        const a = String(
          first[sortColumn] ?? "",
        );

        const b = String(
          second[sortColumn] ?? "",
        );

        const comparison =
          a.localeCompare(
            b,
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            },
          );

        return ascending
          ? comparison
          : -comparison;
      },
    );
  }, [
    rows,
    search,
    filters,
    sortColumn,
    ascending,
  ]);
}