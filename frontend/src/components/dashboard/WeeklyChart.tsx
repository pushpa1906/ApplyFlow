import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartDatum } from "../../hooks/useDashboard";
import Card from "../common/Card";
interface Props{data:ChartDatum[];}
export default function WeeklyChart({data}:Props){return <Card className="chart-card"><div className="section-heading"><div><span className="eyebrow">Activity</span><h3>Last 7 days</h3></div></div><ResponsiveContainer width="100%" height={290}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="#657449" radius={[9,9,0,0]}/></BarChart></ResponsiveContainer></Card>}
