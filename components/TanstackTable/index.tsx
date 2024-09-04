'use client'

import { NextAction } from '@prisma/client'
import { Table } from '@radix-ui/themes'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import FilterDropdown from './FilterDropdown'
import Pagination from './Pagination'

interface TanstackTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
}

const TanstackTable = <T,>({ data, columns }: TanstackTableProps<T>) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 30 })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [nextActionFilterValue, setNextActionFilterValue] = useState('ALL')

  useEffect(() => {
    setColumnFilters(
      searchParams.get('nextAction')
        ? [{ id: 'nextAction', value: searchParams.get('nextAction') }]
        : []
    )
    setNextActionFilterValue(searchParams.get('nextAction') || 'ALL')
  }, [searchParams, setNextActionFilterValue, setColumnFilters])

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

  const setColumnFilter = (currentId: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(currentId, value)
    router.push(pathname + '?' + params.toString())
  }

  const removeColumnFilter = (currentId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(currentId)
    router.push(pathname + '?' + params.toString())
  }

  const onNextActionFilterChange = (value: string) => {
    if (value === 'ALL') {
      removeColumnFilter('nextAction')
    } else {
      setColumnFilter('nextAction', value)
    }
  }

  return (
    <>
      <FilterDropdown
        onValueChange={onNextActionFilterChange}
        values={[...Object.keys(NextAction), 'ALL']}
        currentValue={nextActionFilterValue}
      />
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
            <Table.Row key={row.id}>
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
