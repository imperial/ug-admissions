import NextAuth from 'next-auth'
import MicrosoftEntraIDProfile from 'next-auth/providers/microsoft-entra-id'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraIDProfile({
      clientId: process.env.MS_ENTRA_CLIENT_ID as string,
      clientSecret: process.env.MS_ENTRA_CLIENT_SECRET as string,
      tenantId: process.env.MS_ENTRA_TENANT_ID
    })
  ]
})
