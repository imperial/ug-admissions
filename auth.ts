import authConfig from '@/auth.config'
import NextAuth from 'next-auth'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  cookies: {
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
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
