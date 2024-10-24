'use client'

import { Table } from '@radix-ui/themes'
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useState } from 'react'

import Pagination from './Pagination'

interface TanstackTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  columnFilters: ColumnFiltersState
  setColumnFilters: OnChangeFn<ColumnFiltersState>
  globalFilter: any
  setGlobalFilter: OnChangeFn<any>
}

const PAGE_SIZE = 5
const RIGHT_BORDER = 'border-r-1 border-gray-400 border'

const TanstackTable = <T,>({
  data,
  columns,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter
}: TanstackTableProps<T>) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE })
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: {
      pagination,
      globalFilter,
      columnFilters,
      sorting
    }
  })

  return (
    <>
      <Table.Root className="border-2 border-gray-300">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeaderCell
                  key={header.id}
                  className="bg-yellow-100 border-b-2 border-black border-r-1 border"
                  onClick={() => {
                    const isSorted = header.column.getIsSorted()
                    header.column.toggleSorting(isSorted === 'asc')
                  }}
                  style={{ cursor: 'pointer' }} // Add pointer cursor
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted()
                    ? header.column.getIsSorted() === 'asc'
                      ? ' 🔼'
                      : ' 🔽'
                    : ''}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>

        <Table.Body>
          {table.getRowModel().rows.map((row, i) => (
            <Table.Row
              key={row.id}
              className={`align-middle ${i % 2 == 0 ? 'bg-gray-200' : 'bg-white'}`}
            >
              {row.getVisibleCells().map((cell, id) => (
                <Table.Cell key={id} className={RIGHT_BORDER}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Pagination
        pageIndex={table.getState().pagination.pageIndex}
        setPage={table.setPageIndex}
        totalPages={table.getPageCount()}
        totalRows={table.getRowCount()}
        visibleRows={table.getRowModel().rows.length}
      />
    </>
  )
}

export default TanstackTable
