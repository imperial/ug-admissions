import ApplicantTable from '@/components/ApplicantTable'
import prisma from '@/db'

import TempButton from './[TempButton]'

export default async function Home() {
  const applicants = await prisma.applicant.findMany({
    select: {
      cid: true,
      firstName: true
    }
  })


  return (
    <>
      <TempButton />
      <ApplicantTable applicants={applicants} />
    </>
  )
}
