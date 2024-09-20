'use client'

import { Table } from '@radix-ui/themes'
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useState } from 'react'

import Pagination from './Pagination'

interface TanstackTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  columnFilters: ColumnFiltersState
  setColumnFilters: OnChangeFn<ColumnFiltersState>
}

const TanstackTable = <T,>({
  data,
  columns,
  columnFilters,
  setColumnFilters
}: TanstackTableProps<T>) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    state: {
      pagination,
      columnFilters
    }
  })

  return (
    <>
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeaderCell key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>

        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id} className="align-middle">
              {row.getVisibleCells().map((cell, id) => (
                <Table.Cell key={id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Pagination
        page={table.getState().pagination.pageIndex}
        setPage={table.setPageIndex}
        totalPages={table.getPageCount()}
      />
    </>
  )
}

export default TanstackTable
