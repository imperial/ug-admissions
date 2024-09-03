import { Select } from '@radix-ui/themes'
import React, { FC } from 'react'

interface FilterDropdownProps {
  onValueChange: (value: string) => void
  values: string[]
  placeholder?: string
}

const FilterDropdown: FC<FilterDropdownProps> = ({ onValueChange, values, placeholder }) => {
  return (
    <Select.Root onValueChange={onValueChange}>
      <Select.Trigger placeholder={placeholder ?? ''} />
      <Select.Content>
        {values.map((value) => (
          <Select.Item key={value} value={value}>
            {value}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}

export default FilterDropdown
