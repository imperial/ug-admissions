'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button, Flex, IconButton } from '@radix-ui/themes'
import React, { FC } from 'react'
import { Pagination as HeadlessPagination } from 'react-headless-pagination'

interface PaginationProps {
  pageIndex: number
  setPage: (page: number) => void
  totalPages: number
  totalRows: number
  visibleRows: number
}

const Pagination: FC<PaginationProps> = ({
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
      Showing {visibleRows} of {totalRows} rows
    </Flex>
  )
}

export default Pagination
