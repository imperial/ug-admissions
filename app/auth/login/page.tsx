'use client'

import { EnterIcon } from '@radix-ui/react-icons'
import { Button, Flex, Heading, Separator, Text } from '@radix-ui/themes'
import { signIn } from 'next-auth/react'
import React from 'react'

const LoginPage = async () => {
  return (
    <Flex gap="6" direction="column">
      <Flex pl="9" pr="9" direction="column" gap="5">
        <Flex direction="column" justify="center" align="center">
          <Heading as="h1">Undergraduate Admissions</Heading>
          <Text>Portal for managing UG admissions</Text>
        </Flex>
        <Separator size="4" />
        <Flex direction="column" gap="3">
          <Button onClick={() => signIn('microsoft-entra-id', { redirectTo: '/' })}>
            <EnterIcon />
            Sign In
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default LoginPage
