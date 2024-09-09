'use client'

import { FormPassbackState } from '@/lib/forms'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { Button, Callout, Flex, Spinner } from '@radix-ui/themes'
import React from 'react'
import { useFormState } from 'react-dom'

interface FormInDialogProps {
  children: React.ReactNode
  action: (prevState: FormPassbackState, formData: FormData) => Promise<FormPassbackState>
  close: () => void
  closeOnSuccess?: boolean
  submitButtonText?: string
}

const FormInDialog: React.FC<FormInDialogProps> = ({
  children,
  action,
  close,
  closeOnSuccess,
  submitButtonText
}) => {
  const [pending, setPending] = React.useState(false)
  const wrappedAction = async (prevState: FormPassbackState, formData: FormData) => {
    const res = await action(prevState, formData)
    setPending(false)
    if (res.status === 'success' && closeOnSuccess) close()
    return res
  }
  const [state, formAction] = useFormState(wrappedAction, { status: '', message: '' })
  return (
    <>
      {!!state.message && (
        <Callout.Root
          size="1"
          color={state.status === 'success' ? 'green' : 'red'}
          className="my-2"
        >
          <Callout.Icon>
            {state.status === 'success' && <CheckCircledIcon />}
            {state.status === 'error' && <CrossCircledIcon />}
          </Callout.Icon>
          <Callout.Text>{state.message}</Callout.Text>
        </Callout.Root>
      )}
      <form action={formAction} onSubmit={() => setPending(true)}>
        {children}
        <Flex justify="end" gap="2" mt="4">
          <Button type="button" variant="soft" color="gray" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner /> : (submitButtonText ?? 'Save')}{' '}
          </Button>
        </Flex>
      </form>
    </>
  )
}

export default FormInDialog
