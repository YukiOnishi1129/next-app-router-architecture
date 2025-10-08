import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

import { users } from "./users";

// Define enum for notification types
export const notificationTypeEnum = pgEnum("notification_type", [
  "REQUEST_CREATED",
  "REQUEST_SUBMITTED",
  "REQUEST_APPROVED",
  "REQUEST_REJECTED",
  "REQUEST_ASSIGNED",
  "COMMENT_ADDED",
  "MENTION",
  "SYSTEM",
]);

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => users.id),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: text("related_entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
