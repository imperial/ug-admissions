'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button, Flex, IconButton, Text, TextField } from '@radix-ui/themes'
import React, { FC } from 'react'
import { Pagination as HeadlessPagination } from 'react-headless-pagination'

interface PaginationProps {
  setPageSize: (size: number) => void
  pageIndex: number
  setPage: (page: number) => void
  totalPages: number
  totalRows: number
  visibleRows: number
}

const Pagination: FC<PaginationProps> = ({
  setPageSize,
  pageIndex,
  setPage,
  totalPages,
  totalRows,
  visibleRows
}) => {
  return (
    <Flex direction="column" gap="4" justify="center" align="center">
      <HeadlessPagination
        totalPages={totalPages}
        edgePageCount={0}
        middlePagesSiblingCount={2}
        currentPage={pageIndex}
        setCurrentPage={setPage}
        truncableText="..."
        className="flex gap-3 mt-3 list-none"
      >
        <HeadlessPagination.PrevButton as={<IconButton variant="outline" />}>
          <ChevronLeftIcon />
        </HeadlessPagination.PrevButton>
        <HeadlessPagination.PageButton
          as={<Button variant="outline" />}
          activeClassName="bg-blue-500 text-white"
        />
        <HeadlessPagination.NextButton as={<IconButton variant="outline" />}>
          <ChevronRightIcon />
        </HeadlessPagination.NextButton>
      </HeadlessPagination>
      <Text>
        Showing {visibleRows} of {totalRows} rows
      </Text>
      <Flex gap="2" align="center" justify="center">
        <Text>
          <i>Rows per page: </i>
        </Text>
        <TextField.Root
          className="w-12"
          type="number"
          min={1}
          step={1}
          defaultValue={5}
          required
          onChange={(e) => {
            setPageSize(e.target.value ? parseInt(e.target.value) : 5)
          }}
        />
      </Flex>
    </Flex>
  )
}

export default Pagination
