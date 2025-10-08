import { z } from 'zod'

import type { CommentDto } from './comment.dto'

export const listCommentsSchema = z.object({
  requestId: z.string(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export type ListCommentsInput = z.input<typeof listCommentsSchema>

export type ListCommentsResponse = {
  success: boolean
  error?: string
  comments?: CommentDto[]
  total?: number
  limit?: number
  offset?: number
}

export type GetCommentThreadResponse = {
  success: boolean
  error?: string
  comments?: CommentDto[]
  total?: number
}
