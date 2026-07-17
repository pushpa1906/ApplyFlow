import { BriefcaseBusiness, LayoutDashboard, LogOut, Settings, Target } from "lucide-react";
import type { AppPage, WorkspaceMode } from "../../types/workspace";

interface Props { currentPage:AppPage; mode:WorkspaceMode; workspace:string; onNavigate:(page:AppPage)=>void; onExit:()=>void; }
const items=[
  {id:"dashboard" as const,label:"Dashboard",icon:LayoutDashboard},
  {id:"applications" as const,label:"Applications",icon:BriefcaseBusiness},
  {id:"goals" as const,label:"Goals",icon:Target},
  {id:"settings" as const,label:"Settings",icon:Settings},
];
export default function Sidebar({currentPage,mode,workspace,onNavigate,onExit}:Props){const modeLabel=mode==="demo"?"Demo workspace":mode==="personal"?"Personal workspace":"Connected workspace";return <aside className="sidebar"><div className="brand"><div className="brand-mark">AF</div><div><strong >ApplyFlow</strong><span>{modeLabel}</span></div></div><nav>{items.map(({id,label,icon:Icon})=><button key={id} className={currentPage===id?"active":""} onClick={()=>onNavigate(id)}><Icon size={18}/>{label}</button>)}</nav><div className="sidebar-workspace"><span>Workspace</span><strong title={workspace}>{workspace||"ApplyFlow"}</strong></div><button className="exit-button" onClick={onExit}><LogOut size={18}/>Exit workspace</button></aside>}
