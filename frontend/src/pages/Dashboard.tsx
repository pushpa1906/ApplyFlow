import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CircleCheckBig,
  CircleX,
  Clock3,
  TriangleAlert,
} from "lucide-react";

import type { ChartDatum } from "../hooks/useDashboard";

import GoalCard from "../components/dashboard/GoalCard";
import KPICards, {
  type KPIItem,
} from "../components/dashboard/KPICards";
import StatusChart from "../components/dashboard/StatusChart";
import WeeklyChart from "../components/dashboard/WeeklyChart";

interface Props {
  total: number;
  today: number;
  week: number;
  interviews: number;
  offers: number;
  rejected: number;

  followUpsToday: number;
  followUpsUpcoming: number;
  followUpsOverdue: number;

  dailyGoal: number;
  weeklyGoal: number;

  statusData: ChartDatum[];
  weeklyData: ChartDatum[];

  onOpenApplications: (status?: string) => void;
}

export default function Dashboard({
  total,
  today,
  week,
  interviews,
  offers,
  rejected,

  followUpsToday,
  followUpsUpcoming,
  followUpsOverdue,

  dailyGoal,
  weeklyGoal,

  statusData,
  weeklyData,

  onOpenApplications,
}: Props) {
  const cards: KPIItem[] = [
    {
      title: "Applications",
      value: total,
      icon: BriefcaseBusiness,
      onClick: () => onOpenApplications(),
    },
    {
      title: "This Week",
      value: week,
      icon: CalendarDays,
    },
    {
      title: "Interviews",
      value: interviews,
      icon: CircleCheckBig,
      onClick: () =>
        onOpenApplications("Interview"),
    },
    {
      title: "Offers",
      value: offers,
      icon: CircleCheckBig,
      onClick: () =>
        onOpenApplications("Offer"),
    },
    {
      title: "Rejected",
      value: rejected,
      icon: CircleX,
      onClick: () =>
        onOpenApplications("Rejected"),
    },
  ];

  return (
    <div className="page-stack">
      {/* KPI cards */}
      <KPICards cards={cards} />

      {/* Goals */}
      <div className="goal-grid">
        <GoalCard
          title="Daily Goal"
          value={today}
          target={dailyGoal}
        />

        <GoalCard
          title="Weekly Goal"
          value={week}
          target={weeklyGoal}
        />

        <div className="card momentum-card">
          <span className="eyebrow">
            Momentum
          </span>

          <h3>
            {today >= dailyGoal
              ? "You did it! 🎉"
              : `${Math.max(
                  dailyGoal - today,
                  0,
                )} applications left today`}
          </h3>

          <p>
            Consistency beats perfection.
            Keep moving one application at
            a time.
          </p>
        </div>
      </div>

      {/* Follow Ups */}
      <section className="follow-up-section">
        <div className="follow-up-section-header">
          <div>
            <span className="eyebrow">
              Follow Ups
            </span>

            <h3>
              Applications needing attention
            </h3>
          </div>
        </div>

        <div className="follow-up-grid">
          {/* Today */}
          <button
            type="button"
            className="card follow-up-card today"
            onClick={() =>
              onOpenApplications(
                "FollowUpToday",
              )
            }
          >
            <div className="follow-up-card-header">
              <span className="follow-up-card-icon">
                <Bell size={18} />
              </span>

              <span>Today</span>
            </div>

            <strong className="follow-up-card-value">
              {followUpsToday}
            </strong>

            <p>
              Due for follow up today
            </p>

            <span className="follow-up-card-link">
              View applications →
            </span>
          </button>

          {/* Upcoming */}
          <button
            type="button"
            className="card follow-up-card upcoming"
            onClick={() =>
              onOpenApplications(
                "FollowUpUpcoming",
              )
            }
          >
            <div className="follow-up-card-header">
              <span className="follow-up-card-icon">
                <Clock3 size={18} />
              </span>

              <span>Upcoming</span>
            </div>

            <strong className="follow-up-card-value">
              {followUpsUpcoming}
            </strong>

            <p>
              Due within the next 7 days
            </p>

            <span className="follow-up-card-link">
              View applications →
            </span>
          </button>

          {/* Overdue */}
          <button
            type="button"
            className="card follow-up-card overdue"
            onClick={() =>
              onOpenApplications(
                "FollowUpOverdue",
              )
            }
          >
            <div className="follow-up-card-header">
              <span className="follow-up-card-icon">
                <TriangleAlert
                  size={18}
                />
              </span>

              <span>Overdue</span>
            </div>

            <strong className="follow-up-card-value">
              {followUpsOverdue}
            </strong>

            <p>
              Past the follow-up date
            </p>

            <span className="follow-up-card-link">
              View applications →
            </span>
          </button>
        </div>
      </section>

      {/* Charts */}
      <div className="charts-grid">
        <StatusChart
          data={statusData}
        />

        <WeeklyChart
          data={weeklyData}
        />
      </div>
    </div>
  );
}