import { Flex, Text, TextProps } from '@radix-ui/themes'
import React, { FC } from 'react'

type LabelledInputProps = TextProps & { label: string }

const LabelledInput: FC<LabelledInputProps> = ({ label, children, ...props }) => {
  return (
    <Flex asChild direction="column" gap="2">
      <label>
        <Text as="div" size="2" weight="bold" {...props}>
          {label}
        </Text>
        {children}
      </label>
    </Flex>
  )
}

export default LabelledInput
