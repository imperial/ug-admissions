import { NextAction } from '@prisma/client'
import { Select } from '@radix-ui/themes'
import React, { FC } from 'react'

interface FilterDropdownProps {
  onValueChange: (value: string) => void
}

const FilterDropdown: FC<FilterDropdownProps> = ({ onValueChange }) => {
  return (
    <Select.Root onValueChange={onValueChange}>
      <Select.Trigger placeholder="Next Action" />
      <Select.Content>
        {[...Object.keys(NextAction), 'ALL'].map((action) => (
          <Select.Item key={action} value={action}>
            {action}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}

export default FilterDropdown
