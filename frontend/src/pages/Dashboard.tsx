import { BriefcaseBusiness, CalendarDays, CircleCheckBig, CircleX } from "lucide-react";
import type { ChartDatum } from "../hooks/useDashboard";
import GoalCard from "../components/dashboard/GoalCard";
import KPICards, { type KPIItem } from "../components/dashboard/KPICards";
import StatusChart from "../components/dashboard/StatusChart";
import WeeklyChart from "../components/dashboard/WeeklyChart";
interface Props { total: number; today: number; week: number; interviews: number; offers: number; rejected: number; dailyGoal: number; weeklyGoal: number; statusData: ChartDatum[]; weeklyData: ChartDatum[]; onOpenApplications: (status?: string) => void; }
export default function Dashboard({ total, today, week, interviews, offers, rejected, dailyGoal, weeklyGoal, statusData, weeklyData, onOpenApplications }: Props) {
    const cards: KPIItem[] = [{
        title: "Applications",
        value: total,
        icon: BriefcaseBusiness, onClick: () => onOpenApplications()
    }, 
    { title: "This week", value: week, icon: CalendarDays }, 
    { title: "Interviews", value: interviews, icon: CircleCheckBig, onClick: () => onOpenApplications("Interview") }, { title: "Offers", value: offers, icon: CircleCheckBig, onClick: () => onOpenApplications("Offer") }, { title: "Rejected", value: rejected, icon: CircleX, onClick: () => onOpenApplications("Rejected") }]; return <div className="page-stack"><KPICards cards={cards} /><div className="goal-grid"><GoalCard title="Daily goal" value={today} target={dailyGoal} /><GoalCard title="Weekly goal" value={week} target={weeklyGoal} /><div className="card momentum-card"><span className="eyebrow">Momentum</span><h3>{today >= dailyGoal ? "You did it! 🎉" : `${Math.max(dailyGoal - today, 0)} applications left today`}</h3><p>Consistency beats perfection. Keep moving one application at a time.</p></div></div><div className="charts-grid"><StatusChart data={statusData} /><WeeklyChart data={weeklyData} /></div></div>
}
