import { useMemo } from "react";
import type { ApplicationRow } from "../types/application";
import { dateOnly, isThisWeek } from "../utils/dates";

export interface ChartDatum {
  name: string;
  value: number;
}

export default function useDashboard(rows: ApplicationRow[]) {
  return useMemo(() => {
    const todayKey = dateOnly(new Date());
    const today = rows.filter((row) => row["Applied Date"] === todayKey).length;
    const week = rows.filter((row) => isThisWeek(row["Applied Date"] ?? "")).length;
    const interviews = rows.filter((row) => /interview|screen|oa|assessment/i.test(row.Status ?? "")).length;
    const offers = rows.filter((row) => /offer/i.test(row.Status ?? "")).length;
    const rejected = rows.filter((row) => /reject/i.test(row.Status ?? "")).length;

    const statusValues = Array.from(
      new Set(rows.map((row) => row.Status).filter((value) => Boolean(value?.trim()))),
    );

    const statusData: ChartDatum[] = statusValues.map((name) => ({
      name,
      value: rows.filter((row) => row.Status === name).length,
    }));

    const weeklyData: ChartDatum[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = dateOnly(date);
      return {
        name: date.toLocaleDateString(undefined, { weekday: "short" }),
        value: rows.filter((row) => row["Applied Date"] === key).length,
      };
    });

    return { today, week, interviews, offers, rejected, statusData, weeklyData };
  }, [rows]);
}
