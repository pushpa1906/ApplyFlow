import { APPLICATION_TABS } from "../../constants/applicationTabs";
import type { ApplicationRow } from "../../types/application";

interface Props {
  rows: ApplicationRow[];
  active: string;
  onChange: (tab: string) => void;
}

export default function ApplicationTabs({
  rows,
  active,
  onChange,
}: Props) {
  return (
    <div className="application-tabs">
      {APPLICATION_TABS.map((tab) => {
        const count = rows.filter(
          tab.match,
        ).length;

        return (
          <button
            key={tab.id}
            className={
              active === tab.id
                ? "active"
                : ""
            }
            onClick={() =>
              onChange(tab.id)
            }
          >
            {tab.label}

            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}