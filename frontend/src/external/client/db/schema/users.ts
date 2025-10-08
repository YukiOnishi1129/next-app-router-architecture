import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Define enums for user status and role
export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
]);
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "MEMBER", "GUEST"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  roles: text("roles").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
