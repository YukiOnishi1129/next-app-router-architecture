import { Notification } from "@/external/domain/notification/notification";
import { UserManagementService } from "@/external/service/auth/UserManagementService";
import { NotificationService } from "@/external/service/notification/NotificationService";

export const notificationService = new NotificationService();
export const userManagementService = new UserManagementService();

export type NotificationDto = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
};

export function mapNotificationToDto(
  notification: Notification
): NotificationDto {
  const json = notification.toJSON();
  return {
    id: json.id,
    userId: json.recipientId,
    type: json.type,
    title: json.title,
    message: json.message,
    read: json.isRead,
    createdAt: json.createdAt,
    readAt: json.readAt,
    relatedEntityType: json.relatedEntityType,
    relatedEntityId: json.relatedEntityId,
  };
}
