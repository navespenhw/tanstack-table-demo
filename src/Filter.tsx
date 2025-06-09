import type {Column} from "@tanstack/react-table";
import {useMemo} from "react";
import {Select, TextField, UNSAFE_Combobox} from "@navikt/ds-react";
import {titleCase} from "./util.ts";

function SelectFilter<T>({ column }: { column: Column<T> }) {
  const columnFilterValue = column.getFilterValue();

  const facetedValues = column.getFacetedUniqueValues();
  const uniqueValues = useMemo(
    () => Array.from(facetedValues.keys()).toSorted(),
    [facetedValues],
  );

  return (
    <Select
      label={`Filter ${column.columnDef.header}`}
      hideLabel
      className="filter"
      size="small"
      value={(columnFilterValue as string[] ?? [])[0]}
      onChange={(e) =>
        column.setFilterValue([e.target.value].filter((e) => !!e))
      }
    >
      <option key="" value="">
        All
      </option>
      {uniqueValues.map((v) => (
        <option key={v} value={v}>
          {titleCase(v)}
        </option>
      ))}
    </Select>
  );
}

function ComboboxFilter<T>({ column }: { column: Column<T> }) {
  const columnFilterValue = column.getFilterValue();

  const facetedValues = column.getFacetedUniqueValues();
  const uniqueValues = useMemo(
    () => Array.from(facetedValues.keys()).toSorted(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <UNSAFE_Combobox
      label={`Filter ${column.columnDef.header}`}
      isMultiSelect
      hideLabel
      className="filter"
      size="small"
      options={uniqueValues}
      selectedOptions={(columnFilterValue as string[] ?? [])}
      onToggleSelected={(opt, isSelected) => {
        if (isSelected) {
          column.setFilterValue((fv?: string[]) =>
            fv ? [...fv, opt] : [opt],
          );
        } else {
          column.setFilterValue((fv?: string[]) =>
            fv ? fv.filter((e) => e !== opt) : [],
          );
        }
      }}
    />
  );
}

export function Filter<T>({ column }: { column: Column<T> }) {
  const columnFilterValue = column.getFilterValue();
  const filterVariant = column.columnDef.meta?.filterVariant;

  switch (filterVariant) {
    case "text":
      return (
        <TextField
          label={`Filter ${column.columnDef.header}`}
          hideLabel
          className="filter"
          size="small"
          value={(columnFilterValue ?? "") as string}
          onChange={(e) => column.setFilterValue(e.target.value)}
        />
      );
    case "select":
      return <SelectFilter column={column} />
    case "select-multi":
      return <ComboboxFilter column={column} />
    default:
      return null;
  }
}
