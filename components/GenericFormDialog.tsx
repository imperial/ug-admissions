'use client'

import { Dialog } from '@radix-ui/themes'
import React from 'react'

interface GenericFormDialogProps {
  children: React.ReactNode
  title: string
  form: React.FC<{ close: () => void }>
  description?: string
}

const GenericFormDialog: React.FC<GenericFormDialogProps> = ({
  children,
  title,
  description,
  form: Form
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>{title}</Dialog.Title>
        {description && <Dialog.Description>{description}</Dialog.Description>}

        <Form
          close={() => {
            setIsOpen(false)
          }}
        />
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default GenericFormDialog
