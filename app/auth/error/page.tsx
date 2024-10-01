'use client'

import { Button, Flex, Heading, Text } from '@radix-ui/themes'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const SUPPORT_EMAIL = 'doc-edtech@imperial.ac.uk'

enum Error {
  Configuration = 'Configuration',
  AccessDenied = 'AccessDenied',
  Verification = 'Verification',
  Default = 'Default'
}

const errorMessageMap = {
  [Error.Configuration]: (
    <Text>
      Failure when attempting to authenticate <br />
      Please contact us if this error persists. <br />
    </Text>
  ),
  [Error.AccessDenied]: (
    <Flex direction="row" gap="4" wrap="wrap">
      <Text>
        Only staff at DoC can access the undergraduate admissions portal <br />
        If you believe that you should have access, please contact us at{' '}
        <Link href={`mailto:${SUPPORT_EMAIL}`} target="_blank">
          {SUPPORT_EMAIL}
        </Link>
        .<br />
      </Text>
    </Flex>
  ),
  [Error.Verification]: (
    <Text>
      Link expired or already used. <br />
      Please request a new one.
    </Text>
  ),
  [Error.Default]: <>Failure to authenticate</>
}

const errorTitleMap = {
  [Error.Configuration]: 'Server Configuration Error',
  [Error.AccessDenied]: 'Access Denied',
  [Error.Verification]: 'Verification Error',
  [Error.Default]: 'Error'
}

export default function AuthErrorPage() {
  const search = useSearchParams()
  const error = search.get('error') as Error

  return (
    <Flex gap="5" direction="column">
      <Flex direction="row" style={{ color: 'var(--red-9)' }} gap="2">
        <Heading as="h2">{errorTitleMap[error] || 'Error'}</Heading>
      </Flex>
      <Text>
        There was an error when trying to authenticate. Please contact us at{' '}
        <Link href={`mailto:${SUPPORT_EMAIL}`} target="_blank">
          {SUPPORT_EMAIL}
        </Link>{' '}
        if this error persists.
      </Text>
      <Flex gap="1" direction="column">
        <Heading as="h4">About this error:</Heading>
        <>{errorMessageMap[error] || 'Unknown Server error'}</>
      </Flex>
      <Button size="3" style={{ width: '100%', textDecoration: 'none' }} variant="outline" asChild>
        <Link href="/auth/login">Back to Login</Link>
      </Button>
    </Flex>
  )
}
