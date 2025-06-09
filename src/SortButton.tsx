import {type Column} from "@tanstack/react-table";
import {ArrowsUpDownIcon, SortDownIcon, SortUpIcon} from "@navikt/aksel-icons";
import type {PropsWithChildren} from "react";

export function SortButton<T>({ column, children }: { column: Column<T> } & PropsWithChildren) {
  return (
    <button
      type="button"
      className="navds-table__sort-button"
      style={{ whiteSpace: "nowrap" }}
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      {column.getIsSorted() ? (
        column.getIsSorted() === "desc" ? (
          <SortDownIcon aria-hidden />
        ) : (
          <SortUpIcon aria-hidden />
        )
      ) : (
        <ArrowsUpDownIcon aria-hidden />
      )}
    </button>
  );
}
