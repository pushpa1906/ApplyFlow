interface Props { value: number; max: number; }
export default function ProgressBar({ value, max }: Props) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <div><div className="progress-track"><div className="progress-value" style={{width:`${percentage}%`}}/></div><div className="progress-caption"><span>{value} of {max}</span><span>{percentage}%</span></div></div>;
}
