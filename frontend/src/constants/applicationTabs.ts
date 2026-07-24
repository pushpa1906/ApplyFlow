import type { ApplicationRow } from "../types/application";

export interface ApplicationTab {
  id: string;
  label: string;
  match: (row: ApplicationRow) => boolean;
}

const status = (row: ApplicationRow) =>
  row["Application Status"] ?? "";

export const APPLICATION_TABS: ApplicationTab[] = [
  {
    id: "all",
    label: "All",
    match: () => true,
  },
  {
    id: "applied",
    label: "Applied",
    match: (row) =>
      [
        "Preparing",
        "Applied",
        "OA Received",
        "OA Completed",
      ].includes(status(row)),
  },
  {
    id: "interview",
    label: "Interviewing",
    match: (row) =>
      [
        "Recruiter Screen / Call",
        "Hiring Manager",
        "Technical Interview",
        "Final Interview",
      ].includes(status(row)),
  },
  {
    id: "offers",
    label: "Offers",
    match: (row) =>
      [
        "Offer",
        "Accepted",
      ].includes(status(row)),
  },
  {
    id: "archived",
    label: "Archived",
    match: (row) =>
      [
        "Rejected",
        "Withdrawn",
        "Ghosted",
      ].includes(status(row)),
  },
];