import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { isHiddenColumn } from "../../constants/hiddenColumns";

import type {
  ApplicationFilter,
  ApplicationRow,
} from "../../types/application";

import Button from "../common/Button";

interface Props {
  open: boolean;
  rows: ApplicationRow[];
  columns: string[];

  onApply: (
    filter: ApplicationFilter,
  ) => void;

  onCancel: () => void;
}

const FILTER_LABELS: Record<
  string,
  string
> = {
  Status: "Application Status",
};

export default function FilterDropdown({
  open,
  rows,
  columns,
  onApply,
  onCancel,
}: Props) {
  const filterable = useMemo(
    () =>
      columns.filter(
        (column) =>
          !isHiddenColumn(column),
      ),
    [columns],
  );

  const [type, setType] =
    useState("");

  const [value, setValue] =
    useState("");

  useEffect(() => {
    if (open) {
      setType((current) =>
        current &&
        filterable.includes(current)
          ? current
          : filterable[0] ?? "",
      );
    }
  }, [open, filterable]);

  useEffect(() => {
    setValue("");
  }, [type]);

  const values = useMemo(() => {
    if (!type) {
      return [];
    }

    return Array.from(
      new Set(
        rows
          .map((row) =>
            String(
              row[type] ?? "",
            ).trim(),
          )
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }, [rows, type]);

  if (!open) {
    return null;
  }

  return (
    <div className="filter-popover">
      <h3>Filters</h3>

      <label>
        Type

        <select
          value={type}
          onChange={(event) =>
            setType(
              event.target.value,
            )
          }
        >
          {filterable.map(
            (column) => (
              <option
                key={column}
                value={column}
              >
                {FILTER_LABELS[
                  column
                ] ?? column}
              </option>
            ),
          )}
        </select>
      </label>

      <label>
        Value

        <select
          value={value}
          onChange={(event) =>
            setValue(
              event.target.value,
            )
          }
        >
          <option value="">
            Select value...
          </option>

          {values.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-actions">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          disabled={
            !type || !value
          }
          onClick={() =>
            onApply({
              type,
              value,
            })
          }
        >
          Apply
        </Button>
      </div>
    </div>
  );
}