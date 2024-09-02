'use client'

import { Table } from '@radix-ui/themes'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Pagination from './Pagination'
import { useState } from 'react'

interface TanstackTableProps<T> {
    data: T[]
    columns: ColumnDef<T, any>[],
}

const TanstackTable = <T,>({ data, columns }: TanstackTableProps<T>) => {
  const [page, setPage] = useState(0)
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <>
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <Table.ColumnHeaderCell key={header.id}>{flexRender(
                header.column.columnDef.header,
                header.getContext()
              )}</Table.ColumnHeaderCell>
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

    <Pagination page={page} setPage={setPage} totalPages={table.getPageCount()}/>
    </>
  )
}


export default TanstackTable