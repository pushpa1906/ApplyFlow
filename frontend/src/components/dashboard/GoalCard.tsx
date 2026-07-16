import Card from "../common/Card";
import ProgressBar from "../common/ProgressBar";
interface Props{title:string;value:number;target:number;}
export default function GoalCard({title,value,target}:Props){const done=value>=target;return <Card><div className="goal-head"><div><span className="eyebrow">{title}</span><h3>{done?"Completed 🎉":`${Math.max(target-value,0)} remaining`}</h3></div><strong>{value}/{target}</strong></div><ProgressBar value={value} max={target}/></Card>}
