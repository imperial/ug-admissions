import { signIn } from '@/auth'
import { EnterIcon } from '@radix-ui/react-icons'
import { Button, Flex, Heading, Separator, Text } from '@radix-ui/themes'
import React from 'react'

const LoginPage = async () => {
  const signInEntraID = async () => {
    'use server'
    try {
      await signIn('microsoft-entra-id', { redirectTo: '/' })
    } catch (error) {
      throw error
    }
  }

  return (
    <Flex gap="6" direction="column">
      <Flex pl="9" pr="9" direction="column" gap="5">
        <Flex direction="column" justify="center" align="center" gap="1">
          <Heading as="h1">Undergraduate Admissions</Heading>
          <Text>Portal for managing UG admissions at DoC, Imperial College London</Text>
        </Flex>
        <Separator size="4" />
        <Flex direction="column" gap="3">
          <form action={signInEntraID}>
            <Button size="3" className="w-full">
              Login with SSO
              <EnterIcon />
            </Button>
          </form>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default LoginPage
