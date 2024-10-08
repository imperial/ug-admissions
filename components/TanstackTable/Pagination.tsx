'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button, IconButton } from '@radix-ui/themes'
import React, { FC } from 'react'
import { Pagination as HeadlessPagination } from 'react-headless-pagination'

interface PaginationProps {
  page: number
  setPage: (page: number) => void
  totalPages: number
}

const Pagination: FC<PaginationProps> = ({ page, setPage, totalPages }) => {
  return (
    <HeadlessPagination
      totalPages={totalPages}
      edgePageCount={0}
      middlePagesSiblingCount={2}
      currentPage={page}
      setCurrentPage={setPage}
      truncableText="..."
      className="flex gap-3 justify-center items-center mt-3 list-none"
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
  )
}

export default Pagination
