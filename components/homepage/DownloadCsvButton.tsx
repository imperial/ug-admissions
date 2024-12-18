import { DownloadIcon } from '@radix-ui/react-icons'
import { Button } from '@radix-ui/themes'
import React, { FC } from 'react'

async function handleDownloadClick(cycle: number) {
  const response = await fetch(`/api/download?cycle=${cycle}`)
  if (response.ok) {
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `offers-${cycle}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } else {
    console.error('Failed to download CSV')
  }
}

const DownloadCsvButton: FC = () => {
  return (
    <Button color="bronze" onClick={() => handleDownloadClick(2526)}>
      <DownloadIcon />
      Download Offers CSV
    </Button>
  )
}

export default DownloadCsvButton
