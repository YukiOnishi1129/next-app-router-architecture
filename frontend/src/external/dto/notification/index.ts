export type { NotificationDto } from './notification.dto'
export {
  markNotificationReadSchema,
  markAllNotificationsReadSchema,
  updateNotificationPreferencesSchema,
  type MarkNotificationReadInput,
  type MarkAllNotificationsReadInput,
  type UpdateNotificationPreferencesInput,
  type NotificationCommandResponse,
  type UpdateNotificationPreferencesResponse,
  type MarkAllNotificationsReadResponse,
} from './notification.command.dto'
export {
  listNotificationsSchema,
  type ListNotificationsInput,
  type ListNotificationsResponse,
  type GetNotificationPreferencesResponse,
} from './notification.query.dto'
