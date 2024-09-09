import { Flex, Text, TextProps } from '@radix-ui/themes'
import React, { FC } from 'react'

type LabelTextProps = TextProps & { label: string }

const LabelText: FC<LabelTextProps> = ({ label, children, ...props }) => {
  return (
    <Flex asChild direction="column" gap="2">
      <>
        <Text as="label" size="2" weight="bold" {...props}>
          {label}
        </Text>
        {children}
      </>
    </Flex>
  )
}

export default LabelText
