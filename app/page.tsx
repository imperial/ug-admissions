import ApplicantTable from '@/components/ApplicantTable'
import prisma from '@/db'

export default async function Home() {
  const applicants = await prisma.applicant.findMany({
    select: {
      cid: true,
      firstName: true
    }
  })

  return <ApplicantTable applicants={applicants} />
}
