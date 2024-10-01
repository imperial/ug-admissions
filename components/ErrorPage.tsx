import { Flex, Heading } from '@radix-ui/themes'
import React from 'react'

export default function ErrorPage({
  children,
  title,
  message
}: {
  children: React.ReactNode
  title: string
  message: string
}) {
  return (
    <div>
      <Flex justify="center" align="center" direction="column" gap="3">
        <Heading as="h1">{title}</Heading>
        <Heading as="h2">{message}</Heading>
        {children}
      </Flex>
    </div>
  )
}
