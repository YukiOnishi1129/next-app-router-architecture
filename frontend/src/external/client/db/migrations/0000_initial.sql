CREATE TYPE "public"."account_role" AS ENUM('ADMIN', 'MEMBER', 'GUEST');--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."request_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('BUDGET', 'LEAVE', 'EQUIPMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'SUBMIT', 'APPROVE', 'REJECT', 'CANCEL');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('REQUEST_CREATED', 'REQUEST_SUBMITTED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'REQUEST_ASSIGNED', 'COMMENT_ADDED', 'MENTION', 'SYSTEM');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"status" "account_status" DEFAULT 'ACTIVE' NOT NULL,
	"roles" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" "request_type" NOT NULL,
	"priority" "request_priority" NOT NULL,
	"status" "request_status" DEFAULT 'DRAFT' NOT NULL,
	"requester_id" text NOT NULL,
	"assignee_id" text,
	"attachment_ids" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"reviewer_id" text
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"request_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"storage_key" text NOT NULL,
	"uploaded_by_id" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by_id" text
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"request_id" text NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"changes" jsonb,
	"metadata" jsonb,
	"actor_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"recipient_id" text NOT NULL,
	"related_entity_type" text,
	"related_entity_id" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_requester_id_accounts_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_assignee_id_accounts_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_reviewer_id_accounts_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_id_accounts_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_deleted_by_id_accounts_id_fk" FOREIGN KEY ("deleted_by_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_accounts_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_accounts_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_accounts_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;