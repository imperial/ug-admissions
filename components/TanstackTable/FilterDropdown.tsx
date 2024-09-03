import { NextAction } from '@prisma/client'
import { Select } from '@radix-ui/themes'
import React from 'react'

const FilterDropdown = () => {
  return (
    <Select.Root>
      <Select.Trigger placeholder="Next Action" />
      <Select.Content>
        {Object.keys(NextAction).map((action) => (
          <Select.Item key={action} value={action}>
            {action}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}

export default FilterDropdown
