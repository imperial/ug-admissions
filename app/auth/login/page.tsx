import { signIn } from '@/auth'
import { EnterIcon } from '@radix-ui/react-icons'
import { Button, Flex, Heading, Separator, Text } from '@radix-ui/themes'
import React from 'react'

const LoginPage = async ({ searchParams }: { searchParams?: { callbackUrl?: string } }) => {
  const signInEntraID = async () => {
    'use server'
    try {
      await signIn('microsoft-entra-id', {
        redirectTo: searchParams?.callbackUrl ?? '/'
      })
    } catch (error) {
      // Next.js handles rethrown redirection error
      // Docs: https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
      throw error
    }
  }

  return (
    <Flex gap="6" direction="column">
      <Flex pl="9" pr="9" direction="column" gap="5">
        <Flex direction="column" justify="center" align="center">
          <Heading as="h1">Undergraduate Admissions</Heading>
          <Text>Portal for managing UG admissions</Text>
        </Flex>
        <Separator size="4" />
        <Flex direction="column" gap="3">
          <form action={signInEntraID} style={{ width: '100%' }}>
            <Button size="3" style={{ width: '100%' }}>
              Login with Microsoft SSO
              <EnterIcon />
            </Button>
          </form>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default LoginPage
