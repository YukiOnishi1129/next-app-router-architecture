import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Define enums for request properties
export const requestTypeEnum = pgEnum('request_type', ['BUDGET', 'LEAVE', 'EQUIPMENT', 'OTHER']);
export const requestPriorityEnum = pgEnum('request_priority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const requestStatusEnum = pgEnum('request_status', [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]);

export const requests = pgTable('requests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: requestTypeEnum('type').notNull(),
  priority: requestPriorityEnum('priority').notNull(),
  status: requestStatusEnum('status').notNull().default('DRAFT'),
  requesterId: text('requester_id')
    .notNull()
    .references(() => users.id),
  assigneeId: text('assignee_id').references(() => users.id),
  attachmentIds: text('attachment_ids').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewerId: text('reviewer_id').references(() => users.id),
});

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;