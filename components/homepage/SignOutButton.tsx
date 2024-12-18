'use client'

import { ExitIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import React, { FC } from 'react'

interface SignOutButtonProps {
  signOutAction: () => Promise<void>
}

const SignOutButton: FC<SignOutButtonProps> = ({ signOutAction }) => {
  return (
    <form action={signOutAction}>
      <Button size="3" color="red">
        Log out
        <ExitIcon />
      </Button>
    </form>
  )
}

export default SignOutButton
