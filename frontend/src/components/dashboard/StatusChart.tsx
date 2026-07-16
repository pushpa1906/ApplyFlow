import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "../../constants/colors";
import type { ChartDatum } from "../../hooks/useDashboard";
import Card from "../common/Card";
interface Props{data:ChartDatum[];}
export default function StatusChart({data}:Props){return <Card className="chart-card"><div className="section-heading"><div><span className="eyebrow">Pipeline</span><h3>Applications by status</h3></div></div>{data.length?<ResponsiveContainer width="100%" height={290}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={66} outerRadius={104} paddingAngle={3}>{data.map((item,index)=><Cell key={item.name} fill={CHART_COLORS[index%CHART_COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>:<div className="empty-chart">No status data yet.</div>}</Card>}
