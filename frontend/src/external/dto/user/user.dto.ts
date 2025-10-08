import { UserRole, UserStatus } from '@/external/domain/user/user'

export type UserDto = {
  id: string
  name: string
  email: string
  status: UserStatus
  roles: UserRole[]
  createdAt: string
  updatedAt: string
}
