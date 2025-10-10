import type { Account as AccountType } from '@/features/account/types/account'

declare module 'next-auth' {
  interface Session {
    account: AccountType
  }
  interface User {
    id: string
    account: AccountType
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    account: AccountType
  }
}
