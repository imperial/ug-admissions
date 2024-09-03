'use server'

import prisma from '@/db'
import { parse } from 'csv-parse/sync'
import { redirect } from 'next/navigation'

export const uploadApplicants = async (formData: FormData) => {
  const csv = formData.get('csv') as File
  const lines = await csv.text()

  const applicants = parse(lines, {
    columns: true,
    skip_empty_lines: true
  })
  console.log(applicants)
  await prisma.applicant.createMany({
    data: applicants
  })
  redirect('/')
}
