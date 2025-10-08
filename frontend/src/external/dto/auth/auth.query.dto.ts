import { z } from 'zod'

export const getSessionSchema = z.object({
  userId: z.string().optional(),
})

export type GetSessionInput = z.input<typeof getSessionSchema>

export type GetSessionResponse = {
  user?: {
    id: string
    name: string
    email: string
    status: string
    roles: string[]
  }
  isAuthenticated: boolean
}
