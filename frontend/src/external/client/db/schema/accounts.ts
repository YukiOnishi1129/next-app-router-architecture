import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

// Define enums for account status and role
export const accountStatusEnum = pgEnum('account_status', [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
])
export const accountRoleEnum = pgEnum('account_role', [
  'ADMIN',
  'MEMBER',
  'GUEST',
])

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  status: accountStatusEnum('status').notNull().default('ACTIVE'),
  roles: text('roles').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type AccountRow = typeof accounts.$inferSelect
export type NewAccountRow = typeof accounts.$inferInsert
