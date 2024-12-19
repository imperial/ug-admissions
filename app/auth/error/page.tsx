import { Button, Flex, Heading, Text } from '@radix-ui/themes'
import Link from 'next/link'

const SUPPORT_EMAIL = 'doc-edtech@imperial.ac.uk'

export default function AuthErrorPage() {
  return (
    <Flex gap="5" direction="column">
      <Flex direction="row" style={{ color: 'var(--red-9)' }} gap="2">
        <Heading as="h2">Error</Heading>
      </Flex>

      <Text>
        There was an error when trying to authenticate because you have not been granted a role in
        the system. Please contact us at{' '}
        <Link href={`mailto:${SUPPORT_EMAIL}`} target="_blank" className="text-blue-700">
          {SUPPORT_EMAIL}
        </Link>{' '}
        if you should have access.
      </Text>

      <Button size="3" style={{ width: '100%', textDecoration: 'none' }} variant="outline" asChild>
        <Link href="/">Back to homepage</Link>
      </Button>
    </Flex>
  )
}
