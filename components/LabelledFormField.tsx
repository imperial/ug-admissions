import { Flex, Text } from '@radix-ui/themes'
import React, { FC } from 'react'

interface LabelledFormFieldProps {
  labelText: string
  children: React.ReactNode
}

const LabelledFormField: FC<LabelledFormFieldProps> = ({ labelText, children }) => {
  return (
    <Flex asChild direction="column" gap="2">
      <label>
        <Text as="div" size="2" weight="bold">
          {labelText}
        </Text>
        {children}
      </label>
    </Flex>
  )
}

export default LabelledFormField
