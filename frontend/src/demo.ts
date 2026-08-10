import type { ApplicationRow } from "./types/application";
import { dateOnly } from "./utils/dates";
import {
  followUpEnabled,
  getAutomaticFollowUpDate,
} from "./utils/followUps";

const companies = [
  "Google",
  "Adobe",
  "Cisco",
  "Salesforce",
  "Tesla",
  "Apple",
  "Microsoft",
  "Datadog",
  "Intuit",
  "Nvidia",
  "Stripe",
  "Atlassian",
];

const roles = [
  "Software Engineer",
  "Frontend Engineer",
  "Web Developer",
  "QA Engineer",
  "Full Stack Developer",
];

const applicationStatuses = [
  "Applied",
  "OA Received",
  "OA Completed",
  "Recruiter Screen / Call",
  "Hiring Manager",
  "Technical Interview",
  "Final Interview",
  "Offer",
  "Rejected",
];

const sources = [
  "LinkedIn",
  "Company Website",
  "Referral",
  "Indeed",
];

const locations = [
  "California",
  "Texas",
  "Remote",
  "New York",
  "Washington",
];

export const demoRows: ApplicationRow[] = Array.from(
  { length: 48 },
  (_, index) => {
    const appliedDate = new Date();

    appliedDate.setDate(
      appliedDate.getDate() - (index % 35),
    );

    const appliedDateValue = dateOnly(appliedDate);

    /*
     * For initial demo data, Last Updated
     * starts as the Applied Date.
     */
    const lastUpdatedValue = appliedDateValue;

    const status =
      applicationStatuses[
        index % applicationStatuses.length
      ];

    /*
     * Follow-up is only generated for
     * statuses that support follow-ups.
     */
    const followUpDate = followUpEnabled(status)
      ? getAutomaticFollowUpDate(
          lastUpdatedValue,
        )
      : "";

    return {
      __applyflow_id: `demo-${index + 1}`,

      Company:
        companies[index % companies.length],

      Role:
        roles[index % roles.length],

      "Application Status": status,

      "Applied Date": appliedDateValue,

      "Application Last Updated":
        lastUpdatedValue,

      "Follow Up Date": followUpDate,

      Location:
        locations[index % locations.length],

      Source:
        sources[index % sources.length],

      Priority:
        ["High", "Medium", "Low"][index % 3],

      "Work Type":
        ["Remote", "Hybrid", "On-site"][
          index % 3
        ],

      "Visa Sponsorship":
        index % 4 === 0
          ? "Yes"
          : "Unknown",

      "Job Link":
        "https://example.com/job",

      Notes:
        index % 5 === 0
          ? "Follow up this week"
          : "",
    };
  },
);