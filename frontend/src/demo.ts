import type { ApplicationRow } from "./types/application";
import { dateOnly } from "./utils/dates";

const companies = ["Google", "Adobe", "Cisco", "Salesforce", "Tesla", "Apple", "Microsoft", "Datadog", "Intuit", "Nvidia", "Stripe", "Atlassian"];
const roles = ["Software Engineer", "Frontend Engineer", "Web Developer", "QA Engineer", "Full Stack Developer"];
const statuses = ["Applied", "Recruiter Screen", "Interview", "Assessment", "Offer", "Rejected"];
const sources = ["LinkedIn", "Company Website", "Referral", "Indeed"];
const locations = ["California", "Texas", "Remote", "New York", "Washington"];

export const demoRows: ApplicationRow[] = Array.from({ length: 48 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (index % 35));
  return {
    __applyflow_id: `demo-${index + 1}`,
    Company: companies[index % companies.length],
    Role: roles[index % roles.length],
    Status: statuses[index % statuses.length],
    "Applied Date": dateOnly(date),
    Location: locations[index % locations.length],
    Source: sources[index % sources.length],
    Priority: ["High", "Medium", "Low"][index % 3],
    "Work Type": ["Remote", "Hybrid", "On-site"][index % 3],
    "Visa Sponsorship": index % 4 === 0 ? "Yes" : "Unknown",
    "Job Link": "https://example.com/job",
    Notes: index % 5 === 0 ? "Follow up this week" : "",
  };
});
