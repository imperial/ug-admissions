import { Button, Flex, Heading } from '@radix-ui/themes'
import Link from 'next/link'
import React from 'react'

export default function NotFoundPage({
  message,
  btnName,
  btnUrl
}: {
  message: string
  btnName: string
  btnUrl: string
}) {
  return (
    <div>
      <Flex justify="center" align="center" direction="column" gap="3">
        <Heading as="h1">404</Heading>
        <Heading as="h2">{message}</Heading>
        <Button asChild>
          <Link href={btnUrl}>{btnName}</Link>
        </Button>
      </Flex>
    </div>
  )
}
