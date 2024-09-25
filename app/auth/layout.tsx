import { auth } from '@/auth'
import { Card, Container, Flex } from '@radix-ui/themes'
import { redirect } from 'next/navigation'
import React from 'react'

const AuthPage = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth()
  if (session) return redirect('/')

  return (
    <Flex width="100%" height="100%" align="center" justify="center">
      <Container maxWidth="40rem">
        <Card variant="surface">
          <Flex direction="column" width="100%" height="100%" gap="3" p="3">
            {children}
          </Flex>
        </Card>
      </Container>
    </Flex>
  )
}

export default AuthPage
