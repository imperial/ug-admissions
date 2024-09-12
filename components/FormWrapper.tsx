'use client'

import { FormPassbackState } from '@/lib/forms'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { Button, Callout, Flex, Spinner } from '@radix-ui/themes'
import React, { FC, ReactNode, useState } from 'react'
import { useFormState } from 'react-dom'

const DEFAULT_SUBMIT_BTN_TEXT = 'Save'

interface FormInDialogProps {
  children: ReactNode
  action: (prevState: FormPassbackState, formData: FormData) => Promise<FormPassbackState>
  submitButtonText?: string
  onSuccess?: () => void
}

const FormWrapper: FC<FormInDialogProps> = ({
  children,
  action,
  submitButtonText,
  onSuccess = () => {}
}) => {
  const [pending, setPending] = useState(false)
  const wrappedAction = async (
    prevState: FormPassbackState,
    formData: FormData
  ): Promise<FormPassbackState> => {
    const res = await action(prevState, formData)
    setPending(false)
    if (res.status === 'success') onSuccess()
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
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner /> : (submitButtonText ?? DEFAULT_SUBMIT_BTN_TEXT)}
          </Button>
        </Flex>
      </form>
    </>
  )
}

export default FormWrapper
