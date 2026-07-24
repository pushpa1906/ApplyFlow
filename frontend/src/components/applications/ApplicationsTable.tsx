
import { useState } from "react"; import {
  Pencil,
  Trash2,
} from "lucide-react";

import { isHiddenColumn } from "../../constants/hiddenColumns";

import type { ApplicationRow } from "../../types/application";

import Dropdown from "../common/Dropdown";
import { getDropdownOptions } from "../../utils/getDropdownOptions";

interface Props {
  rows: ApplicationRow[];
  columns: string[];
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
}

export default function ApplicationsTable({
  rows,
  columns,
  sortColumn,
  ascending,
  onSort,
  onEdit,
  onDelete,
  onCellUpdate,
}: Props) {
  const visibleColumns =
    columns.filter(
      (column) =>
        !isHiddenColumn(column),
    );
  const [updatingCell, setUpdatingCell] = useState<string | null>(null);


  return (
    <div className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {visibleColumns.map(
                (column) => (
                  <th key={column}>
                    <button
                      onClick={() =>
                        onSort(column)
                      }
                    >
                      {column}

                      {sortColumn ===
                        column && (
                          <span>
                            {ascending
                              ? " ↑"
                              : " ↓"}
                          </span>
                        )}
                    </button>
                  </th>
                ),
              )}

              <th className="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={
                  row.__applyflow_id
                }
              >
                {visibleColumns.map((column) => {
                  const dropdownOptions =
                    getDropdownOptions(column);

                  const value = String(
                    row[column] ?? "",
                  );

                  return (
                    <td key={column}>
                      {dropdownOptions ? (
                        <Dropdown
                          value={value}
                          options={dropdownOptions}
                          disabled={
                            updatingCell ===
                            `${row.__applyflow_id}-${column}`
                          }
                          onChange={async (newValue) => {
                            const cellId = `${row.__applyflow_id}-${column}`;

                            try {
                              setUpdatingCell(cellId);

                              await onCellUpdate(
                                row.__applyflow_id,
                                column,
                                newValue,
                              );
                            } finally {
                              setUpdatingCell(null);
                            }
                          }}
                        />
                      ) : (
                        column === "Job Link" ||
                          column === "Company Website/Career Page" ? (
                          value ? (
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="table-link"
                            >
                              Open ↗
                            </a>
                          ) : (
                            "-"
                          )
                        ) : (
                          <span>{value}</span>
                        )
                      )}
                    </td>
                  );
                })}

                <td className="actions-column">
                  <div className="row-actions">
                    <button
                      onClick={() =>
                        onEdit(row)
                      }
                      aria-label="Edit"
                    >
                      <Pencil
                        size={16}
                      />
                    </button>

                    <button
                      className="delete-action"
                      onClick={() =>
                        onDelete(
                          row.__applyflow_id,
                        )
                      }
                      aria-label="Delete"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="table-empty">
            <h3>
              No applications found
            </h3>

            <p>
              Try changing your
              search or removing a
              filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}