import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { requests } from './requests';

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  requestId: text('request_id')
    .notNull()
    .references(() => requests.id),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  edited: boolean('edited').notNull().default(false),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;