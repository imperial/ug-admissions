import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const AuthErrorPage = dynamic(
  () => import('../../../components/AuthErrorPage').then((mod) => mod.AuthErrorPage),
  {
    suspense: true
  }
)

export default function AuthErrorPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorPage />
    </Suspense>
  )
}
