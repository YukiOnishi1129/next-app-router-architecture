import { AuditService } from "@/external/service/AuditService";
import { AuditEventType } from "@/external/domain";
import { UserManagementService } from "@/external/service/auth/UserManagementService";
import { UserStatus, UserRole, User } from "@/external/domain/user/user";

export const userManagementService = new UserManagementService();
export const auditService = new AuditService();

export type UserDto = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
};

export const SERVER_AUDIT_CONTEXT = {
  ipAddress: "server",
  userAgent: "server-command",
};

export function mapUserToDto(user: User): UserDto {
  return {
    id: user.getId().getValue(),
    name: user.getName(),
    email: user.getEmail().getValue(),
    status: user.getStatus(),
    roles: user.getRoles(),
    createdAt: user.getCreatedAt().toISOString(),
    updatedAt: user.getUpdatedAt().toISOString(),
  };
}

export { AuditEventType };
