'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Dialog } from '@radix-ui/themes'
import React, { FC, ReactNode } from 'react'

interface GenericFormDialogProps {
  children: ReactNode
  title: string
  description?: string
  trigger: ReactNode
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const GenericDialog: FC<GenericFormDialogProps> = ({
  children,
  title,
  description,
  trigger,
  isOpen,
  setIsOpen
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Content>
        <Cross2Icon
          color="gray"
          className="w-6 h-6 absolute top-2 right-2 "
          onClick={() => setIsOpen(false)}
        />
        <Dialog.Title>{title}</Dialog.Title>
        {description && <Dialog.Description>{description}</Dialog.Description>}
        {children}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default GenericDialog
