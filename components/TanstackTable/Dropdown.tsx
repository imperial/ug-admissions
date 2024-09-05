import { Flex, Select, Text } from '@radix-ui/themes'
import React, { FC } from 'react'

interface DropdownProps {
  onValueChange?: (value: string) => void
  values: string[]
  currentValue?: string
  placeholder?: string
  title?: string
}

const Dropdown: FC<DropdownProps> = ({
  onValueChange,
  values,
  currentValue,
  placeholder,
  title
}) => {
  return (
    <Flex gapX="3" align="center">
      {title && <Text className="text-center">{`${title}:`}</Text>}
      <Select.Root onValueChange={onValueChange} value={currentValue}>
        <Select.Trigger placeholder={placeholder ?? ''} />
        <Select.Content>
          {values.map((value) => (
            <Select.Item key={value} value={value}>
              {value}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  )
}

export default Dropdown
