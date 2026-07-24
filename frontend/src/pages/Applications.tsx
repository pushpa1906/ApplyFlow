import { useMemo, useState } from "react";

import ApplicationTabs from "../components/applications/ApplicationTabs";
import ApplicationsTable from "../components/applications/ApplicationsTable";
import SearchToolbar from "../components/applications/SearchToolbar";
import { APPLICATION_TABS } from "../constants/applicationTabs";

import type {
  ApplicationFilter,
  ApplicationRow,
} from "../types/application";

interface Props {
  allRows: ApplicationRow[];
  rows: ApplicationRow[];
  columns: string[];

  search: string;
  setSearch: (value: string) => void;

  filters: ApplicationFilter[];
  setFilters: (
    filters: ApplicationFilter[],
  ) => void;

  sortColumn: string;
  ascending: boolean;

  onSort: (column: string) => void;
  onEdit: (row: ApplicationRow) => void;
  onDelete: (id: string) => void;

  onCellUpdate: (
    id: string,
    column: string,
    value: string,
  ) => Promise<void> | void;

  onNew: () => void;
}

export default function Applications({
  allRows,
  rows,
  columns,
  search,
  setSearch,
  filters,
  setFilters,
  sortColumn,
  ascending,
  onSort,
  onEdit,
  onDelete,
  onCellUpdate,
  onNew,
}: Props) {
  const [tab, setTab] =
    useState("all");

  const visibleRows = useMemo(() => {
    const currentTab =
      APPLICATION_TABS.find(
        (item) => item.id === tab,
      );

    if (!currentTab) {
      return rows;
    }

    return rows.filter(
      currentTab.match,
    );
  }, [rows, tab]);

  return (
    <div className="page-stack">
      <ApplicationTabs
        rows={allRows}
        active={tab}
        onChange={setTab}
      />

      <SearchToolbar
        rows={allRows}
        columns={columns}
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        onNew={onNew}
      />

      <ApplicationsTable
        rows={visibleRows}
        columns={columns}
        sortColumn={sortColumn}
        ascending={ascending}
        onSort={onSort}
        onEdit={onEdit}
        onDelete={onDelete}
        onCellUpdate={onCellUpdate}
      />
    </div>
  );
}