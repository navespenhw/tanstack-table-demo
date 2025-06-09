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
  columnHelper.accessor('species', {
    header: 'Species',
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
    cell: (i) => i.getValue(),
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
    data,
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
                  const text = flexRender(h.column.columnDef.header, h.getContext());
                  return (
                    <Table.ColumnHeader key={h.id} textSize="small" aria-sort={ariaSort(h.column.getIsSorted())}>
                      <Filter column={h.column}/>
                      <HStack justify="space-between" align="center" wrap={false}>
                        {h.isPlaceholder
                          ? null
                          : h.column.getCanSort()
                            ? <SortButton column={h.column}>{text}</SortButton>
                            : text}
                        {h.column.getCanGroup() &&
                          <Switch size="small" checked={h.column.getIsGrouped()}
                                  onChange={h.column.getToggleGroupingHandler()}> </Switch>
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
                {r.getVisibleCells().map((c) => {
                  const cd = c.column.columnDef;
                  return (
                    <Table.DataCell key={c.id} align={cd.meta?.textAlign} textSize="small">
                      {c.getIsAggregated()
                        ? flexRender(cd.aggregatedCell ?? cd.cell, c.getContext())
                        : flexRender(cd.cell, c.getContext())
                      }
                      {c.getIsGrouped() && ` (${r.subRows.length})`}
                    </Table.DataCell>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <HStack gap="6" justify="space-between">
          <BodyShort>
            Showing {table.getRowModel().rows.length.toLocaleString()} of{" "}
            {table.getRowCount()} rows
            {table.getState().grouping.length === 0 &&
              ` (${data.length - table.getRowCount()} hidden by filters)`
            }
          </BodyShort>
          <Pagination
            page={table.getState().pagination.pageIndex + 1}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            count={table.getPageCount()}
          />
        </HStack>
      </VStack>
    </Page.Block>
  </Page>
}

export default App
