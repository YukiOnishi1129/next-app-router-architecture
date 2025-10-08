export type CommentDto = {
  id: string
  content: string
  requestId: string
  authorId: string
  parentId?: string
  createdAt: string
  updatedAt: string
  isEdited: boolean
}
