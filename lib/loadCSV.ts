'use server'

import prisma from '@/db'
import { Applicant } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { redirect } from 'next/navigation'

// uploadUsers
// uploadTmuaScores/extra application data
// uploadOutcomes

export const uploadApplicants = async (formData: FormData) => {
  const csv = formData.get('csv') as File
  const lines = await csv.text()

  const applicants: Applicant[] = parse(lines, {
    columns: true,
    skip_empty_lines: true
  })

  // in both cases, create a new application record with initial 'nextAction' as 'TMUA_CANDIDATE' if no TMUA score

  const applicantUpserts = applicants.map((a) =>
    prisma.applicant.upsert({
      where: {
        cid: a.cid
      },
      update: {
        cid: a.cid,
        ucasNumber: a.ucasNumber,
        gender: a.gender,
        firstName: a.firstName,
        surname: a.surname,
        email: a.email,
        primaryNationality: a.primaryNationality,
        otherNationality: a.otherNationality
      },
      create: {
        cid: a.cid,
        ucasNumber: a.ucasNumber,
        gender: a.gender,
        firstName: a.firstName,
        surname: a.surname,
        email: a.email,
        primaryNationality: a.primaryNationality,
        otherNationality: a.otherNationality
      }
    })
  )

  await Promise.all(applicantUpserts)

  redirect('/')
}
