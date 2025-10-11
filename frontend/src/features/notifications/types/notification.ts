export type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  read: boolean
  readAt?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
}
