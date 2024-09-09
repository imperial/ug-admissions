'use client'

import FormInDialog from '@/components/FormInDialog'
import GenericFormDialog from '@/components/GenericFormDialog'
import { testServerAction } from '@/lib/forms'
import { Button, Text, TextField } from '@radix-ui/themes'
import React, { useState } from 'react'

const TestFormRenderer = ({ close }: { close: () => void }) => {
  const [dummy, setDummy] = useState(false)
  return (
    <FormInDialog action={testServerAction} close={close} submitButtonText="Submit">
      <label>
        <Text>Name:</Text>
        <TextField.Root name="name" />
      </label>
      <label>
        <Text>Surname:</Text>
        <TextField.Root name="surname" />
      </label>
      <label>
        <Text>Email:</Text>
        <TextField.Root name="name" type="email" />
      </label>
    </FormInDialog>
  )
}

export const TestForm = () => (
  <GenericFormDialog title="Test dialog" form={TestFormRenderer}>
    <Button>Trigger test</Button>
  </GenericFormDialog>
)
