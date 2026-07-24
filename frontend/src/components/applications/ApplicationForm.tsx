import { useEffect, useMemo, useState } from "react";

import { isHiddenColumn } from "../../constants/hiddenColumns";

import type {
  ApplicationFormData,
  ApplicationRow,
} from "../../types/application";

import Button from "../common/Button";
import Dropdown from "../common/Dropdown";
import Modal from "../common/Modal";
import { getDropdownOptions } from "../../utils/getDropdownOptions";

interface Props {
  open: boolean;
  columns: string[];
  initial: ApplicationRow | null;
  loading: boolean;
  onClose: () => void;
  onSave: (
    row: ApplicationFormData,
  ) => Promise<void> | void;
}

const requiredColumns = [
  "Company",
  "Role",
  "Application Status",
  "Applied Date",
];

export default function ApplicationForm({
  open,
  columns,
  initial,
  loading,
  onClose,
  onSave,
}: Props) {
  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) => !isHiddenColumn(column),
      ),
    [columns],
  );

  const [form, setForm] =
    useState<ApplicationFormData>({});

  useEffect(() => {
    if (!open) return;

    setForm(
      Object.fromEntries(
        visibleColumns.map((column) => [
          column,
          initial?.[column] ?? "",
        ]),
      ),
    );
  }, [open, initial, visibleColumns]);

  function update(
    column: string,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [column]: value,
    }));
  }

  return (
    <Modal
      open={open}
      title={
        initial
          ? "Edit application"
          : "New application"
      }
      onClose={onClose}
    >
      <form
        className="application-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSave(form);
        }}
      >
        {visibleColumns.map((column) => {
          const options =
            getDropdownOptions(column);

          return (
            <label
              key={column}
              className={
                column === "Notes"
                  ? "full-span"
                  : ""
              }
            >
              <span>
                {column}

                {requiredColumns.includes(
                  column,
                ) && <b>*</b>}
              </span>

              {options ? (
                <Dropdown
                  value={form[column] ?? ""}
                  options={options}
                  onChange={(value) =>
                    update(column, value)
                  }
                />
              ) : column === "Notes" ? (
                <textarea
                  rows={5}
                  value={form[column] ?? ""}
                  onChange={(e) =>
                    update(
                      column,
                      e.target.value,
                    )
                  }
                />
              ) : (
                <input
                  type={
                    column
                      .toLowerCase()
                      .includes("date")
                      ? "date"
                      : "text"
                  }
                  value={form[column] ?? ""}
                  onChange={(e) =>
                    update(
                      column,
                      e.target.value,
                    )
                  }
                  required={requiredColumns.includes(
                    column,
                  )}
                />
              )}
            </label>
          );
        })}

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save application"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}