import { useEffect, useState } from "react";
import { api } from "../api";
import { demoRows } from "../demo";
import type { ApplicationFormData, ApplicationRow } from "../types/application";
import type { WorkspaceData, WorkspaceMode } from "../types/workspace";
import { extractSpreadsheetId } from "../utils/sheets";

const FOLLOW_UP_COLUMNS = [
  "Application Last Updated",
  "Follow Up Date",
];

function visibleWorkspaceColumns(columns: string[]) {
  const cleaned = columns.filter(
    (column) => column !== "__applyflow_id",
  );

  for (const column of FOLLOW_UP_COLUMNS) {
    if (!cleaned.includes(column)) {
      cleaned.push(column);
    }
  }

  return cleaned;
}

function mergeRowColumns(
  current: string[],
  row: ApplicationRow,
) {
  const next = [...current];

  for (const column of Object.keys(row)) {
    if (
      column !== "__applyflow_id" &&
      !next.includes(column)
    ) {
      next.push(column);
    }
  }

  for (const column of FOLLOW_UP_COLUMNS) {
    if (!next.includes(column)) {
      next.push(column);
    }
  }

  return next;
}

export default function useWorkspace() {
  const [mode, setMode] = useState<WorkspaceMode>("welcome");
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [sheetId, setSheetId] = useState(localStorage.getItem("applyflow_sheet_id") ?? "");
  const [accessCode, setAccessCode] = useState(sessionStorage.getItem("applyflow_access_code") ?? "");
  const [sheetName, setSheetName] = useState("");
  const [lastSync, setLastSync] = useState("");
  const [serviceEmail, setServiceEmail] = useState("");
  const [personalAvailable, setPersonalAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  function applyWorkspace(data: WorkspaceData) {
    setRows(data.rows);
    setColumns(visibleWorkspaceColumns(data.columns));
    setSheetName(data.spreadsheet_name);
    setLastSync(data.last_sync);
  }

  useEffect(() => {
    let active = true;
    api.config()
      .then((config) => {
        if (!active) return;
        setServiceEmail(config.service_account_email);
        setPersonalAvailable(config.personal_available);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = toast ? window.setTimeout(() => setToast(""), 3200) : undefined;
    return () => { if (timer) window.clearTimeout(timer); };
  }, [toast]);

  useEffect(() => {
    const previousMode = localStorage.getItem("applyflow_last_mode");
    if (previousMode === "sheet" && sheetId) {
      void connectSheet(sheetId, true);
    }
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && (mode === "sheet" || mode === "personal")) {
        void sync();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [mode, sheetId, accessCode]);

  async function connectSheet(value: string, silent = false) {
    try {
      setLoading(true);
      setError("");
      const id = extractSpreadsheetId(value);
      if (!id) throw new Error("Enter a Google Sheets URL or spreadsheet ID.");
      await api.validate(id);
      const data = await api.list(id);
      applyWorkspace(data);
      setSheetId(id);
      localStorage.setItem("applyflow_sheet_id", id);
      localStorage.setItem("applyflow_last_mode", "sheet");
      setMode("sheet");
    } catch (reason) {
      if (!silent) setError((reason as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function openDemo() {
    const data = structuredClone(demoRows);
    setRows(data);
    setColumns(
      visibleWorkspaceColumns(
        Object.keys(data[0]),
      ),
    );
    setSheetName("ApplyFlow Demo Workspace");
    setLastSync(new Date().toISOString());
    setMode("demo");
    setError("");
    localStorage.removeItem("applyflow_last_mode");
  }

  async function openPersonal() {
    try {
      setLoading(true);
      setError("");
      const data = await api.list(undefined, true, accessCode);
      applyWorkspace(data);
      sessionStorage.setItem("applyflow_access_code", accessCode);
      localStorage.setItem("applyflow_last_mode", "personal");
      setMode("personal");
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function sync() {
    if (mode === "demo") {
      setToast("Demo workspace is already up to date.");
      return;
    }
    try {
      setSyncing(true);
      const data = await api.list(sheetId, mode === "personal", accessCode);
      applyWorkspace(data);
      setToast("Workspace synchronized.");
    } catch (reason) {
      setToast((reason as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  async function create(row: ApplicationFormData) {
    if (mode === "demo") {
      const saved = {
        ...row,
        __applyflow_id: `demo-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,
      } as ApplicationRow;

      setRows((current) => [
        saved,
        ...current,
      ]);
      setColumns((current) =>
        mergeRowColumns(current, saved),
      );

      return saved;
    }

    const saved = await api.create(
      row,
      sheetId,
      mode === "personal",
      accessCode,
    );

    const data = await api.list(
      sheetId,
      mode === "personal",
      accessCode,
    );

    applyWorkspace(data);

    return saved;
  }

  async function update(id: string, row: ApplicationFormData) {
    if (mode === "demo") {
      const updated = {
        ...rows.find((item) => item.__applyflow_id === id),
        ...row,
        __applyflow_id: id,
      } as ApplicationRow;

      setRows((current) =>
        current.map((item) =>
          item.__applyflow_id === id ? updated : item,
        ),
      );
      setColumns((current) =>
        mergeRowColumns(current, updated),
      );

      return updated;
    }

    const updated = await api.update(
      id,
      row,
      sheetId,
      mode === "personal",
      accessCode,
    );

    setRows((current) =>
      current.map((item) =>
        item.__applyflow_id === id ? updated : item,
      ),
    );
    setColumns((current) =>
      mergeRowColumns(current, updated),
    );

    return updated;
  }

  async function remove(id: string) {
    if (mode !== "demo") {
      await api.remove(
        id,
        sheetId,
        mode === "personal",
        accessCode,
      );
    }

    setRows((current) =>
      current.filter(
        (item) => item.__applyflow_id !== id,
      ),
    );
  }

  function disconnect() {
    localStorage.removeItem("applyflow_sheet_id");
    localStorage.removeItem("applyflow_last_mode");
    sessionStorage.removeItem("applyflow_access_code");
    setMode("welcome");
    setRows([]);
    setColumns([]);
    setSheetId("");
    setAccessCode("");
    setSheetName("");
    setLastSync("");
    setError("");
  }

  return {
    mode, rows, columns, sheetId, accessCode, sheetName, lastSync,
    serviceEmail, personalAvailable, loading, syncing, error, toast,
    setSheetId, setAccessCode, setToast,
    connectSheet, openDemo, openPersonal, sync, create, update, remove, disconnect,
  };
}
