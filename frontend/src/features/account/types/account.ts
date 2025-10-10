export type Account = {
  id: string
  name: string
  email: string
  status: AccountStatus
  roles: AccountRole[]
  createdAt: string
  updatedAt: string
}

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export type AccountRole = 'ADMIN' | 'MEMBER' | 'GUEST'
