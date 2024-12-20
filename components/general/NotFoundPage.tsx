import { Button, Flex, Heading, Link, Text } from '@radix-ui/themes'
import React from 'react'

interface NotFoundPageProps {
  btnName: string
  btnUrl: string
  explanation?: string
}

export default function NotFoundPage({ btnName, btnUrl, explanation }: NotFoundPageProps) {
  return (
    <div>
      <Flex justify="center" align="center" direction="column" gap="3">
        <Heading as="h1">404: Page Not Found</Heading>
        {explanation && <Text>{explanation}</Text>}
        <Button asChild>
          <Link href={btnUrl}>{btnName}</Link>
        </Button>
      </Flex>
    </div>
  )
}
