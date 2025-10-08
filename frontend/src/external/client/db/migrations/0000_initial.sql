CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'MEMBER', 'GUEST');
CREATE TYPE "request_type" AS ENUM ('BUDGET', 'LEAVE', 'EQUIPMENT', 'OTHER');
CREATE TYPE "request_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "request_status" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'SUBMIT', 'APPROVE', 'REJECT', 'CANCEL');
CREATE TYPE "notification_type" AS ENUM ('REQUEST_CREATED', 'REQUEST_SUBMITTED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'REQUEST_ASSIGNED', 'COMMENT_ADDED', 'MENTION', 'SYSTEM');

CREATE TABLE "users" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
  "roles" text[] NOT NULL DEFAULT ARRAY[]::text[],
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "users_email_unique" UNIQUE ("email")
);

CREATE TABLE "requests" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "type" "request_type" NOT NULL,
  "priority" "request_priority" NOT NULL,
  "status" "request_status" NOT NULL DEFAULT 'DRAFT',
  "requester_id" text NOT NULL,
  "assignee_id" text,
  "attachment_ids" text[] NOT NULL DEFAULT ARRAY[]::text[],
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "submitted_at" timestamptz,
  "reviewed_at" timestamptz,
  "reviewer_id" text
);

CREATE TABLE "attachments" (
  "id" text PRIMARY KEY,
  "request_id" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size" integer NOT NULL,
  "mime_type" text NOT NULL,
  "storage_key" text NOT NULL,
  "uploaded_by_id" text NOT NULL,
  "uploaded_at" timestamptz NOT NULL DEFAULT now(),
  "deleted" boolean NOT NULL DEFAULT false,
  "deleted_at" timestamptz,
  "deleted_by_id" text
);

CREATE TABLE "comments" (
  "id" text PRIMARY KEY,
  "content" text NOT NULL,
  "request_id" text NOT NULL,
  "author_id" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "edited" boolean NOT NULL DEFAULT false,
  "deleted" boolean NOT NULL DEFAULT false,
  "deleted_at" timestamptz
);

CREATE TABLE "audit_logs" (
  "id" text PRIMARY KEY,
  "entity_type" text NOT NULL,
  "entity_id" text NOT NULL,
  "action" "audit_action" NOT NULL,
  "changes" jsonb,
  "metadata" jsonb,
  "user_id" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "notifications" (
  "id" text PRIMARY KEY,
  "type" "notification_type" NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "recipient_id" text NOT NULL,
  "related_entity_type" text,
  "related_entity_id" text,
  "is_read" boolean NOT NULL DEFAULT false,
  "read_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "requests"
  ADD CONSTRAINT "requests_requester_id_users_id_fk"
  FOREIGN KEY ("requester_id") REFERENCES "users" ("id");

ALTER TABLE "requests"
  ADD CONSTRAINT "requests_assignee_id_users_id_fk"
  FOREIGN KEY ("assignee_id") REFERENCES "users" ("id");

ALTER TABLE "requests"
  ADD CONSTRAINT "requests_reviewer_id_users_id_fk"
  FOREIGN KEY ("reviewer_id") REFERENCES "users" ("id");

ALTER TABLE "attachments"
  ADD CONSTRAINT "attachments_request_id_requests_id_fk"
  FOREIGN KEY ("request_id") REFERENCES "requests" ("id");

ALTER TABLE "attachments"
  ADD CONSTRAINT "attachments_uploaded_by_id_users_id_fk"
  FOREIGN KEY ("uploaded_by_id") REFERENCES "users" ("id");

ALTER TABLE "attachments"
  ADD CONSTRAINT "attachments_deleted_by_id_users_id_fk"
  FOREIGN KEY ("deleted_by_id") REFERENCES "users" ("id");

ALTER TABLE "comments"
  ADD CONSTRAINT "comments_request_id_requests_id_fk"
  FOREIGN KEY ("request_id") REFERENCES "requests" ("id");

ALTER TABLE "comments"
  ADD CONSTRAINT "comments_author_id_users_id_fk"
  FOREIGN KEY ("author_id") REFERENCES "users" ("id");

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_recipient_id_users_id_fk"
  FOREIGN KEY ("recipient_id") REFERENCES "users" ("id");

