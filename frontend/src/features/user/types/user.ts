export type User = {
  id: string
  name: string
  email: string
  status: UserStatus
  roles: UserRole[]
  createdAt: string
  updatedAt: string
}

type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

type UserRole = 'ADMIN' | 'MEMBER' | 'GUEST'
