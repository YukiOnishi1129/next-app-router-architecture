import type { User as UserType } from '@/features/user/types/user'

declare module 'next-auth' {
  interface Session {
    account: UserType
  }
  interface User {
    id: string
    account: UserType
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    account: UserType
  }
}
