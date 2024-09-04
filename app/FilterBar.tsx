'use client'

import FilterDropdown from '@/components/TanstackTable/FilterDropdown'
import { Card } from '@radix-ui/themes'
import React from 'react'

const FilterBar = () => {
  return (
    <Card>
      <FilterDropdown
        values={['apple', 'banana']}
        currentValue={'apple'}
        onValueChange={() => {}}
      />
    </Card>
  )
}

export default FilterBar
