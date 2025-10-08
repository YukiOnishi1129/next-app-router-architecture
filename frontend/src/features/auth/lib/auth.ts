import NextAuth from 'next-auth'

import { authOptions } from '@/features/auth/lib/option'

export const handler = NextAuth(authOptions)
