import { DROPDOWN_OPTIONS } from "../constants/dropdownOptions";

export function getDropdownOptions(column: string): string[] | null {

  const options = DROPDOWN_OPTIONS[
    column as keyof typeof DROPDOWN_OPTIONS
  ];

  return options ? Array.from(options) : null;
}