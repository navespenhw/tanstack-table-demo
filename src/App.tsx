import "./App.css";
import {
  ActionMenu,
  BodyShort,
  Button,
  Heading,
  HStack,
  Page,
  Pagination,
  Switch,
  Table,
  VStack
} from "@navikt/ds-react";
import {
  createColumnHelper,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import {MenuElipsisVerticalCircleIcon} from '@navikt/aksel-icons';
import {amountFormat, ariaSort, makeData, type Pet, titleCase} from "./util.ts";
import {Filter} from "./Filter.tsx";
import {SortButton} from "./SortButton.tsx";
import {useMemo} from "react";

const includesSome: FilterFn<Pet> = (
  row,
  columnId,
  filterValue: unknown[],
) => {
  return filterValue.some((e) => row.getValue(columnId) === e);
};
includesSome.autoRemove = (v) => {
  return !v || !v.length;
};

const columnHelper = createColumnHelper<Pet>()

const columns = [
  columnHelper.accessor('type', {
    header: 'Type',
    cell: (i) => titleCase(i.getValue()),
    filterFn: includesSome,
    enableGrouping: true,
    meta: {
      filterVariant: 'select-multi'
    }
  }),
  columnHelper.accessor('breed', {
    header: 'Breed',
    aggregationFn: "uniqueCount",
    sortUndefined: "last",
    cell: (i) => i.getValue(),
    aggregatedCell: i => i.getValue<number>() > 1 && i.getValue() + " breeds",
    filterFn: includesSome,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    aggregationFn: "uniqueCount",
    aggregatedCell: i => i.getValue<number>() > 1 && i.getValue() + " distinct names",
    meta: {
      filterVariant: 'text'
    }
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    aggregationFn: "mean",
    aggregatedCell: i => "Mean age: " + Math.round(i.getValue() * 100) / 100
  }),
  columnHelper.accessor('amountRaised', {
    header: 'Amount raised',
    sortingFn: 'alphanumeric',
    sortUndefined: "last",
    aggregationFn: "sum",
    cell: i => amountFormat(i.getValue()),
    aggregatedCell: i => amountFormat(i.getValue()),
    meta: {
      textAlign: 'right',
    }
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => <ActionMenu>
      <ActionMenu.Trigger>
        <Button variant="tertiary-neutral" icon={<MenuElipsisVerticalCircleIcon/>}/>
      </ActionMenu.Trigger>
      <ActionMenu.Content align='end'>
        <ActionMenu.Group label='Group 1'>
          <ActionMenu.Item>Item 1</ActionMenu.Item>
          <ActionMenu.Item>Item 2</ActionMenu.Item>
        </ActionMenu.Group>
        <ActionMenu.Group label='Group 2'>
          <ActionMenu.Item>Item 3</ActionMenu.Item>
        </ActionMenu.Group>
      </ActionMenu.Content>
    </ActionMenu>,
    meta: {
      textAlign: 'right',
    }
  }),
]

function App() {
  const data: Pet[] = useMemo(() => makeData(50000), []);
  const table = useReactTable({
    data: data,
    columns,
    defaultColumn: {
      enableGrouping: false
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return <Page>
    <Page.Block width="2xl">
      <Heading size="xlarge" spacing>Animal shelter fundraising</Heading>
      <VStack gap="4" paddingBlock="4">
        <Table>
          <Table.Header>
            {table.getHeaderGroups().map((hg) => (
              <Table.Row key={hg.id}>
                {hg.headers.map((h) => {
                  const sortable = h.column.getCanSort();
                  return (
                    <Table.ColumnHeader
                      key={h.id}
                      textSize="small"
                      aria-sort={ariaSort(h.column.getIsSorted())}
                    >
                      {h.column.columnDef.meta?.filterVariant && (
                        <Filter column={h.column}/>
                      )}
                      <HStack justify="space-between" align="center" wrap={false}>
                        {h.isPlaceholder ? null : sortable ? (
                          <SortButton column={h.column}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                          </SortButton>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                        {h.column.getCanGroup() &&
                            <Switch size="small" checked={h.column.getIsGrouped()} onChange={h.column.getToggleGroupingHandler()}>Group</Switch>
                        }
                      </HStack>
                    </Table.ColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((r) => (
              <Table.Row key={r.id}>
                {r.getVisibleCells().map((c) => (
                  <Table.DataCell
                    key={c.id}
                    align={c.column.columnDef.meta?.textAlign}
                    textSize="small"
                  >
                    {c.getIsAggregated()
                      ? flexRender(c.column.columnDef.aggregatedCell ?? c.column.columnDef.cell, c.getContext())
                      : flexRender(c.column.columnDef.cell, c.getContext())
                    }
                    {c.getIsGrouped() && ` (${r.subRows.length})`}
                  </Table.DataCell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <HStack gap="6" justify="space-between">
          <BodyShort>
            Showing {table.getRowModel().rows.length.toLocaleString()} of{" "}
            {table.getRowCount()} rows ({data.length - table.getRowCount()}{" "}
            hidden by filters)
          </BodyShort>
          <Pagination
            page={table.getState().pagination.pageIndex + 1}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            count={table.getPageCount()}
            boundaryCount={1}
            siblingCount={1}
            srHeading={{
              tag: "h2",
              text: "Pagination",
            }}
          />
        </HStack>
      </VStack>
    </Page.Block>
  </Page>
}

export default App
