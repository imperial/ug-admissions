import authConfig from '@/auth.config'
import NextAuth from 'next-auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
  session: { strategy: 'jwt' }
})
