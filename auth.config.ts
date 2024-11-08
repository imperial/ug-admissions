import { NextAuthConfig } from 'next-auth'
import MicrosoftEntraIDProfile from 'next-auth/providers/microsoft-entra-id'

export default {
  providers: [
    MicrosoftEntraIDProfile({
      clientId: process.env.MS_ENTRA_CLIENT_ID,
      clientSecret: process.env.MS_ENTRA_CLIENT_SECRET,
      tenantId: process.env.MS_ENTRA_TENANT_ID,
      authorization: {
        params: {
          scope: 'offline_access openid profile email User.Read'
        }
      }
    })
  ],

  callbacks: {
    authorized: async ({ auth }) => {
      // Logged-in users are always authorized
      return !!auth
    },
    signIn: async () => {
      return true
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  }
} satisfies NextAuthConfig
