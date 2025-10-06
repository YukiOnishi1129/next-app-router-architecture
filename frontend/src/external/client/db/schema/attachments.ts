import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { requests } from './requests';

export const attachments = pgTable('attachments', {
  id: text('id').primaryKey(),
  requestId: text('request_id')
    .notNull()
    .references(() => requests.id),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  storageKey: text('storage_key').notNull(),
  uploadedById: text('uploaded_by_id')
    .notNull()
    .references(() => users.id),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedById: text('deleted_by_id').references(() => users.id),
});

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;