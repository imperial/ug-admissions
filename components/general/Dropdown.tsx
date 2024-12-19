import { prettifyOption } from '@/lib/utils'
import { Select } from '@radix-ui/themes'
import React, { FC } from 'react'

interface DropdownProps {
  onValueChange?: (value: string) => void
  values: string[]
  currentValue?: string
  placeholder?: string
  disabled?: boolean
  valueFormatter?: (value: string) => string
  className?: string
}

const Dropdown: FC<DropdownProps> = ({
  onValueChange,
  values,
  currentValue,
  placeholder,
  disabled = false,
  valueFormatter = prettifyOption,
  className
}) => {
  return (
    <Select.Root onValueChange={onValueChange} value={currentValue} disabled={disabled}>
      <Select.Trigger placeholder={placeholder ?? ''} className={className} />
      <Select.Content position="popper">
        {values.map((value) => (
          <Select.Item key={value} value={value}>
            {valueFormatter(value)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  )
}

export default Dropdown
