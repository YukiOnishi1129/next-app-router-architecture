#!/usr/bin/env tsx

import "./utils/loadEnv";
import { randomUUID } from "crypto";
import {
  attachments,
  auditLogs,
  comments,
  notifications,
  requests,
  users,
} from "../src/external/client/db/schema";
import { db, closeConnection } from "../src/external/client/db/client";

async function main() {
  console.log("Seeding database...");

  try {
    await db.transaction(async (tx) => {
      // Clear tables in dependency order
      await tx.delete(attachments);
      await tx.delete(comments);
      await tx.delete(notifications);
      await tx.delete(auditLogs);
      await tx.delete(requests);
      await tx.delete(users);

      const now = new Date();

      const adminUserId = randomUUID();
      const memberUserId = randomUUID();
      const reviewerUserId = randomUUID();

      await tx.insert(users).values([
        {
          id: adminUserId,
          name: "Alice Admin",
          email: "alice.admin@example.com",
          roles: ["ADMIN"],
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: memberUserId,
          name: "Bob Member",
          email: "bob.member@example.com",
          roles: ["MEMBER"],
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: reviewerUserId,
          name: "Carol Reviewer",
          email: "carol.reviewer@example.com",
          roles: ["MEMBER"],
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const requestId = randomUUID();
      const attachmentId = randomUUID();
      const commentId = randomUUID();

      await tx.insert(requests).values([
        {
          id: requestId,
          title: "Laptop upgrade request",
          description:
            "Current laptop is underpowered for current project workloads. Requesting an upgrade to a new MacBook Pro.",
          type: "EQUIPMENT",
          priority: "HIGH",
          status: "IN_REVIEW",
          requesterId: memberUserId,
          assigneeId: adminUserId,
          attachmentIds: [attachmentId],
          createdAt: now,
          updatedAt: now,
          submittedAt: now,
          reviewerId: reviewerUserId,
        },
      ]);

      await tx.insert(attachments).values([
        {
          id: attachmentId,
          requestId,
          fileName: "hardware-quote.pdf",
          fileSize: 250000,
          mimeType: "application/pdf",
          storageKey: `requests/${requestId}/attachments/${attachmentId}`,
          uploadedById: memberUserId,
          uploadedAt: now,
          deleted: false,
        },
      ]);

      await tx.insert(comments).values([
        {
          id: commentId,
          content:
            "Please provide details about the required specifications and project timeline.",
          requestId,
          authorId: adminUserId,
          createdAt: now,
          updatedAt: now,
          edited: false,
          deleted: false,
        },
      ]);

      await tx.insert(notifications).values([
        {
          id: randomUUID(),
          type: "REQUEST_SUBMITTED",
          title: "New request submitted",
          message: "Bob Member submitted a new equipment request.",
          recipientId: adminUserId,
          relatedEntityType: "REQUEST",
          relatedEntityId: requestId,
          isRead: false,
          createdAt: now,
        },
      ]);

      await tx.insert(auditLogs).values([
        {
          id: randomUUID(),
          entityType: "REQUEST",
          entityId: requestId,
          action: "CREATE",
          changes: null,
          metadata: {
            title: "Laptop upgrade request",
            priority: "HIGH",
          },
          userId: memberUserId,
          createdAt: now,
        },
        {
          id: randomUUID(),
          entityType: "REQUEST",
          entityId: requestId,
          action: "SUBMIT",
          changes: null,
          metadata: {
            assigneeId: adminUserId,
          },
          userId: memberUserId,
          createdAt: now,
        },
      ]);
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await closeConnection();
  }
}

main();
