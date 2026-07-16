import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ApplicationForm from "./components/applications/ApplicationForm";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import { DEFAULT_SETTINGS, DEFAULT_SORT_COLUMN } from "./constants/defaults";
import useDashboard from "./hooks/useDashboard";
import useFilters from "./hooks/useFilters";
import useWorkspace from "./hooks/useWorkspace";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Welcome from "./pages/Welcome";

import type { ApplicationFilter, ApplicationFormData, ApplicationRow } from "./types/application";
import type { AppSettings } from "./types/settings";
import type { AppPage } from "./types/workspace";
import { dateOnly } from "./utils/dates";

export default function App() {
  const workspace = useWorkspace();
  const dashboard = useDashboard(workspace.rows);
  const [page, setPage] = useState<AppPage>("dashboard");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ApplicationFilter[]>([]);
  const [sortColumn, setSortColumn] = useState(DEFAULT_SORT_COLUMN);
  const [ascending, setAscending] = useState(false);
  const [editing, setEditing] = useState<ApplicationRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      return JSON.parse(localStorage.getItem("applyflow_settings") ?? "") as AppSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const filteredRows = useFilters(workspace.rows, search, filters, sortColumn, ascending);

  useEffect(() => {
    localStorage.setItem("applyflow_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!settings.celebrations) return;
    const dailyKey = `applyflow-daily-${dateOnly(new Date())}`;
    if (dashboard.today >= settings.dailyGoal && !localStorage.getItem(dailyKey)) {
      localStorage.setItem(dailyKey, "1");
      workspace.setToast("🎉 Daily goal completed — you did it!");
    }
  }, [dashboard.today, settings.dailyGoal, settings.celebrations]);

  async function saveApplication(row: ApplicationFormData) {
    try {
      setSaving(true);
      if (editing) await workspace.update(editing.__applyflow_id, row);
      else await workspace.create(row);
      setFormOpen(false);
      setEditing(null);
      workspace.setToast(editing ? "Application updated." : "Application added.");
    } catch (reason) {
      workspace.setToast((reason as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteApplication(id: string) {
    if (!window.confirm("Delete this application?")) return;
    try {
      await workspace.remove(id);
      workspace.setToast("Application deleted.");
    } catch (reason) {
      workspace.setToast((reason as Error).message);
    }
  }

  if (workspace.mode === "welcome") {
    return <Welcome loading={workspace.loading} error={workspace.error} sheetId={workspace.sheetId} setSheetId={workspace.setSheetId} connect={()=>workspace.connectSheet(workspace.sheetId)} openDemo={workspace.openDemo} personalAvailable={workspace.personalAvailable} accessCode={workspace.accessCode} setAccessCode={workspace.setAccessCode} openPersonal={workspace.openPersonal} serviceEmail={workspace.serviceEmail}/>;
  }

  const subtitle = workspace.lastSync
    ? `${workspace.sheetName} · Synced ${new Date(workspace.lastSync).toLocaleString()}`
    : workspace.sheetName;

  return <div className="app-shell">
    <Sidebar currentPage={page} mode={workspace.mode} workspace={workspace.sheetName} onNavigate={setPage} onExit={workspace.disconnect}/>
    <main className="main-content">
      <Header title={page.charAt(0).toUpperCase()+page.slice(1)} subtitle={subtitle} syncing={workspace.syncing} onSync={workspace.sync}/>
      <AnimatePresence mode="wait"><motion.section key={page} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:.18}}>
        {page==="dashboard"&&<Dashboard total={workspace.rows.length} today={dashboard.today} week={dashboard.week} interviews={dashboard.interviews} offers={dashboard.offers} rejected={dashboard.rejected} dailyGoal={settings.dailyGoal} weeklyGoal={settings.weeklyGoal} statusData={dashboard.statusData} weeklyData={dashboard.weeklyData} onOpenApplications={(status)=>{setFilters(status?[{type:"Status",value:status}]:[]);setPage("applications");}}/>}
        {page==="applications"&&<Applications allRows={workspace.rows} rows={filteredRows} columns={workspace.columns} search={search} setSearch={setSearch} filters={filters} setFilters={setFilters} sortColumn={sortColumn} ascending={ascending} onSort={(column)=>{if(column===sortColumn)setAscending((value)=>!value);else{setSortColumn(column);setAscending(true);}}} onEdit={(row)=>{setEditing(row);setFormOpen(true);}} onDelete={deleteApplication} onNew={()=>{setEditing(null);setFormOpen(true);}}/>}
        {page==="goals"&&<Goals today={dashboard.today} week={dashboard.week} dailyGoal={settings.dailyGoal} weeklyGoal={settings.weeklyGoal}/>} 
        {page==="settings"&&<Settings mode={workspace.mode} sheetId={workspace.sheetId} serviceEmail={workspace.serviceEmail} dailyGoal={settings.dailyGoal} weeklyGoal={settings.weeklyGoal} celebrations={settings.celebrations} setDailyGoal={(value)=>setSettings((current)=>({...current,dailyGoal:value}))} setWeeklyGoal={(value)=>setSettings((current)=>({...current,weeklyGoal:value}))} setCelebrations={(value)=>setSettings((current)=>({...current,celebrations:value}))} onSync={workspace.sync} onDisconnect={workspace.disconnect}/>} 
      </motion.section></AnimatePresence>
    </main>
    <ApplicationForm open={formOpen} columns={workspace.columns} initial={editing} loading={saving} onClose={()=>{setFormOpen(false);setEditing(null);}} onSave={saveApplication}/>
    {workspace.toast&&<div className="toast">{workspace.toast}</div>}
  </div>;
}
