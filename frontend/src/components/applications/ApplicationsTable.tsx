import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { isHiddenColumn } from "../../constants/hiddenColumns";
import type { ApplicationRow } from "../../types/application";
import StatusBadge from "./StatusBadge";

interface Props {
  rows: ApplicationRow[];
  columns: string[];
  sortColumn: string;
  ascending: boolean;
  onSort: (column: string) => void;
  onEdit: (row: ApplicationRow) => void;
  onDelete: (id: string) => void;
}

export default function ApplicationsTable({ rows, columns, sortColumn, ascending, onSort, onEdit, onDelete }: Props) {
  const visibleColumns = columns.filter((column) => !isHiddenColumn(column));
  return <div className="table-card"><div className="table-scroll"><table><thead><tr>{visibleColumns.map((column)=><th key={column}><button onClick={()=>onSort(column)}>{column}{sortColumn===column&&<span>{ascending?" ↑":" ↓"}</span>}</button></th>)}<th className="actions-column">Actions</th></tr></thead><tbody>{rows.map((row)=><tr key={row.__applyflow_id}>{visibleColumns.map((column)=><td key={column} title={row[column]}>{column==="Status"?<StatusBadge status={row[column]}/>:column==="Job Link"&&row[column]?<a href={row[column]} target="_blank" rel="noreferrer" className="link-cell">Open <ExternalLink size={13}/></a>:row[column]||<span className="empty-value">—</span>}</td>)}<td className="actions-column"><div className="row-actions"><button onClick={()=>onEdit(row)} aria-label="Edit"><Pencil size={16}/></button><button className="delete-action" onClick={()=>onDelete(row.__applyflow_id)} aria-label="Delete"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>{rows.length===0&&<div className="table-empty"><h3>No applications found</h3><p>Try changing your search or removing a filter.</p></div>}</div></div>;
}
