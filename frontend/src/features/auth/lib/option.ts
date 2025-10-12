import CredentialsProvider from 'next-auth/providers/credentials'

import { authorizeServer } from '@/features/auth/servers/authorization.server'

import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
        action: { label: 'Action', type: 'text' },
        name: { label: 'Name', type: 'text' },
        previousEmail: { label: 'Previous Email', type: 'text' },
      },
      async authorize(credentials) {
        return await authorizeServer({
          email: credentials?.email,
          password: credentials?.password,
          action: credentials?.action,
          name: credentials?.name,
          previousEmail: credentials?.previousEmail,
        })
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
        token.account = user.account
      }
      return token
    },
    async session({ session, token }) {
      if (token?.account) {
        session.account = token.account
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
}
