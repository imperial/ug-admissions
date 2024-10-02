import { auth } from '@/auth'
import AdmissionsCycleStatistics from '@/components/AdmissionsCycleStatistics'
import prisma from '@/db'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdmissionsCycleStatisticsPage({
  params
}: {
  params: { cycle: string }
}) {
  // Redirect to login page if not authenticated
  const session = await auth()
  if (!session) {
    redirect('/auth/login')
  }

  const userEmail = session?.user?.email as string
  const cycle = parseInt(params.cycle)

  const noApplications = await prisma.application.count({
    where: {
      admissionsCycle: cycle
    }
  })

  return <AdmissionsCycleStatistics cycle={Number(params.cycle)} noApplications={noApplications} />
}
