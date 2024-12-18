import { allowedAccess } from '@/lib/query/users'
import NextAuth, { NextAuthConfig } from 'next-auth'
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id'

const config = {
  session: { strategy: 'jwt' },
  providers: [MicrosoftEntraID],
  callbacks: {
    signIn: async ({ profile }) => {
      if (!profile || !profile.email) {
        return false
      }
      return allowedAccess(profile.email)
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
