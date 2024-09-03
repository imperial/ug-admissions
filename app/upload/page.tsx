import { uploadApplicants } from '@/lib/loadCSV'
import { Button } from '@radix-ui/themes'
import React from 'react'

const page = () => {
  return (
    <form action={uploadApplicants} className="flex flex-col gap-5 p-7">
      <input type="file" name="csv" />
      <Button type="submit">Submit</Button>
    </form>
  )
}

export default page
