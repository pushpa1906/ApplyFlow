import type { LucideIcon } from "lucide-react";
import Card from "../common/Card";
export interface KPIItem{title:string;value:number;subtitle?:string;icon?:LucideIcon;onClick?:()=>void;}
interface Props{cards:KPIItem[];}
export default function KPICards({cards}:Props){return <div className="kpi-grid">{cards.map(({title,value,subtitle,icon:Icon,onClick})=><button key={title} onClick={onClick} className="kpi-button"><Card className="kpi-card">{Icon&&<div className="kpi-icon"><Icon size={18}/></div>}<span>{title}</span><strong>{value}</strong>{subtitle&&<small>{subtitle}</small>}</Card></button>)}</div>}
