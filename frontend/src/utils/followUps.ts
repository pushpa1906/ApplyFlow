import {
  dateOnly,
  parseDate,
} from "./dates";

/* Statuses that should have active follow-up reminders.*/
export const FOLLOW_UP_ENABLED_STATUSES = [
  "Applied",
  "OA Received",
  "OA Completed",
  "Recruiter Screen / Call",
  "Hiring Manager",
  "Technical Interview",
  "Final Interview",
  "Offer",
];

/* Number of days after the application's last update before a follow-up is due.*/
export const FOLLOW_UP_DAYS = 7;


/* Check whether status supports follow-ups */

export function followUpEnabled(
  status: string,
): boolean {
  return FOLLOW_UP_ENABLED_STATUSES.includes(
    status,
  );
}


/* Calculate Follow Up Date
   Follow Up Date = Application Last Updated + 7 days */

export function getAutomaticFollowUpDate(
  lastUpdatedDate: string,
): string {
  const lastUpdated =
    parseDate(lastUpdatedDate);

  if (!lastUpdated) {
    return "";
  }

  const followUpDate =
    new Date(lastUpdated);

  followUpDate.setHours(
    0,
    0,
    0,
    0,
  );

  followUpDate.setDate(
    followUpDate.getDate() +
      FOLLOW_UP_DAYS,
  );

  return dateOnly(
    followUpDate,
  );
}


/* Follow-up is TODAY */

export function isFollowUpToday(
  date: string,
  status: string,
): boolean {
  if (!followUpEnabled(status)) {
    return false;
  }

  const followUp =
    parseDate(date);

  if (!followUp) {
    return false;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  followUp.setHours(
    0,
    0,
    0,
    0,
  );

  return (
    followUp.getTime() ===
    today.getTime()
  );
}


/*Follow-up is OVERDUE*/

export function isFollowUpOverdue(
  date: string,
  status: string,
): boolean {
  if (!followUpEnabled(status)) {
    return false;
  }

  const followUp =
    parseDate(date);

  if (!followUp) {
    return false;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  followUp.setHours(
    0,
    0,
    0,
    0,
  );

  return followUp < today;
}


/* Follow-up is UPCOMING
  Upcoming = within the next 7 days, excluding today. */

export function isFollowUpUpcoming(
  date: string,
  status: string,
): boolean {
  if (!followUpEnabled(status)) {
    return false;
  }

  const followUp =
    parseDate(date);

  if (!followUp) {
    return false;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  followUp.setHours(
    0,
    0,
    0,
    0,
  );

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const diff =
    (followUp.getTime() -
      today.getTime()) /
    millisecondsPerDay;

  return (
    diff > 0 &&
    diff <= FOLLOW_UP_DAYS
  );
}