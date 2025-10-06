import { pgTable, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Define enum for audit action types
export const auditActionEnum = pgEnum('audit_action', [
  'CREATE',
  'UPDATE',
  'DELETE',
  'VIEW',
  'SUBMIT',
  'APPROVE',
  'REJECT',
  'CANCEL',
]);

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: auditActionEnum('action').notNull(),
  changes: jsonb('changes'),
  metadata: jsonb('metadata'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;