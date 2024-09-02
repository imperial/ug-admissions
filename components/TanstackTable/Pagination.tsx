'use client'

import React from 'react'
import { Pagination as HeadlessPagination } from 'react-headless-pagination'

interface PaginationProps {
  page: number
  setPage: (page: number) => void
  totalPages: number
}

const Pagination = ({ page, setPage, totalPages }: PaginationProps) => {
  return (
    <>
      Current page: {page + 1}
      <HeadlessPagination
        totalPages={totalPages}
        edgePageCount={0}
        middlePagesSiblingCount={2}
        currentPage={page}
        setCurrentPage={setPage}
        truncableText="..."
      >
        <HeadlessPagination.PrevButton className="">Previous</HeadlessPagination.PrevButton>

        <nav className="flex justify-center flex-grow">
          <ul className="flex items-center">
            <HeadlessPagination.PageButton activeClassName="" inactiveClassName="" className="" />
          </ul>
        </nav>

        <HeadlessPagination.NextButton className="">Next</HeadlessPagination.NextButton>
      </HeadlessPagination>
    </>
  )
}

export default Pagination
