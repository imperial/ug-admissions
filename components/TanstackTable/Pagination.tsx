'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { Button, IconButton } from '@radix-ui/themes'
import React from 'react'
import { Pagination as HeadlessPagination } from 'react-headless-pagination'
import styles from './pagination.module.css'


interface PaginationProps {
  page: number
  setPage: (page: number) => void
  totalPages: number
}

const Pagination = ({ page, setPage, totalPages }: PaginationProps) => {
  return (
      <HeadlessPagination
        totalPages={totalPages}
        edgePageCount={0}
        middlePagesSiblingCount={2}
        currentPage={page}
        setCurrentPage={setPage}
        truncableText="..."
        className={styles.pagination}
      >
        <HeadlessPagination.PrevButton as={<IconButton variant="outline" />}>
          <ChevronLeftIcon />
        </HeadlessPagination.PrevButton>

        <HeadlessPagination.PageButton
          as={<Button variant="outline" />}
          activeClassName={styles.activePageButton}
        />

        <HeadlessPagination.NextButton as={<IconButton variant="outline" />}>
          <ChevronRightIcon />
        </HeadlessPagination.NextButton>
      </HeadlessPagination>
  )
}

export default Pagination
