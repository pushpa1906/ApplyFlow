import GoalCard from "../components/dashboard/GoalCard";
import Card from "../components/common/Card";
interface Props{today:number;week:number;dailyGoal:number;weeklyGoal:number;}
export default function Goals({today,week,dailyGoal,weeklyGoal}:Props){return <div className="page-stack"><div className="goal-grid two"><GoalCard title="Daily goal" value={today} target={dailyGoal}/><GoalCard title="Weekly goal" value={week} target={weeklyGoal}/></div><Card><span className="eyebrow">How goals work</span><h3 className="info-title">Progress is calculated from Applied Date</h3><p className="muted-copy">Every application whose Applied Date is today counts toward the daily goal. Applications from the current Monday-to-Sunday week count toward the weekly goal.</p></Card></div>}
