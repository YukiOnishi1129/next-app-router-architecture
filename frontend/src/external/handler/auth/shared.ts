import { AuthenticationService } from "@/external/service/auth/AuthenticationService";
import { UserManagementService } from "@/external/service/auth/UserManagementService";
import {
  AuditService,
  type AuditContext,
} from "@/external/service/audit/AuditService";

export const authService = new AuthenticationService({
  apiKey: process.env.GCP_IDENTITY_PLATFORM_API_KEY!,
  projectId: process.env.GCP_PROJECT_ID!,
});

export const userManagementService = new UserManagementService();
export const auditService = new AuditService();

export const SERVER_CONTEXT: AuditContext = {
  ipAddress: "server",
  userAgent: "server-action",
};
