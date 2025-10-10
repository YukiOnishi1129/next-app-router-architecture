export type NotificationDto = {
  id: string
  accountId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  readAt?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
}
