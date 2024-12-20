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

import Pagination, { DEFAULT_PAGE_SIZE } from './Pagination'

interface GenericTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  columnFilters: ColumnFiltersState
  setColumnFilters: OnChangeFn<ColumnFiltersState>
  globalFilter: any
  setGlobalFilter: OnChangeFn<any>
}

const GenericTable = <T,>({
  data,
  columns,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter
}: GenericTableProps<T>) => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: pageSize })
  const [sorting, setSorting] = useState<SortingState>([])

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPagination({ pageIndex: 0, pageSize: newPageSize })
    // timeout forces scroll to happen after re-render
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }, 0)
  }

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
                  className="bg-blue-100 border-b-2 border-black border-r-1 border"
                  onClick={() => {
                    const isSorted = header.column.getIsSorted()
                    header.column.toggleSorting(isSorted === 'asc')
                  }}
                  style={{ cursor: 'pointer' }}
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
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id} className="odd:bg-gray-100">
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
        setPageSize={handlePageSizeChange}
        pageIndex={table.getState().pagination.pageIndex}
        setPage={table.setPageIndex}
        totalPages={table.getPageCount()}
        totalRows={table.getRowCount()}
        visibleRows={table.getRowModel().rows.length}
      />
    </>
  )
}

export default GenericTable
