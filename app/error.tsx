'use client'

// Error boundaries must be Client Components
import ErrorPage from '@/components/ErrorPage'
import { Button } from '@radix-ui/themes'
import React, { useEffect } from 'react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorPage title="Oops!" message="Something went wrong!">
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </ErrorPage>
  )
}
