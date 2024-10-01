import { Select } from '@radix-ui/themes'
import React, { FC } from 'react'

interface DropdownProps {
  onValueChange?: (value: string) => void
  values: string[]
  currentValue?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

const Dropdown: FC<DropdownProps> = ({
  onValueChange,
  values,
  currentValue,
  placeholder,
  disabled = false,
  className
}) => {
  return (
    <Select.Root onValueChange={onValueChange} value={currentValue} disabled={disabled}>
      <Select.Trigger placeholder={placeholder ?? ''} className={className} />
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

export default Dropdown
