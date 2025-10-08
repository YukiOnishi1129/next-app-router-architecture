export type NotificationDto = {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  readAt?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
}
