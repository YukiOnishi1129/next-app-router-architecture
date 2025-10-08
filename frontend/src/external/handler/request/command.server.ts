import "server-only";

import { z } from "zod";

import {
  RequestPriority,
  RequestType,
} from "@/external/domain/request/request-status";

import {
  workflowService,
  approvalService,
  userManagementService,
  mapRequestToDto,
} from "./shared";
import { getSessionServer } from "../auth/query.server";

import type { RequestDto } from "./shared";

const createRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  type: z.nativeEnum(RequestType),
  priority: z.nativeEnum(RequestPriority),
  assigneeId: z.string().optional(),
});

const updateRequestSchema = z.object({
  requestId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  type: z.nativeEnum(RequestType),
  priority: z.nativeEnum(RequestPriority),
});

const submitRequestSchema = z.object({
  requestId: z.string(),
});

const reviewRequestSchema = z.object({
  requestId: z.string(),
});

const approveRequestSchema = z.object({
  requestId: z.string(),
  comments: z.string().optional(),
});

const rejectRequestSchema = z.object({
  requestId: z.string(),
  reason: z.string().min(1),
});

const cancelRequestSchema = z.object({
  requestId: z.string(),
  reason: z.string().min(1).optional(),
});

const assignRequestSchema = z.object({
  requestId: z.string(),
  assigneeId: z.string(),
});

export type CreateRequestInput = z.input<typeof createRequestSchema>;
export type UpdateRequestInput = z.input<typeof updateRequestSchema>;
export type SubmitRequestInput = z.input<typeof submitRequestSchema>;
export type ReviewRequestInput = z.input<typeof reviewRequestSchema>;
export type ApproveRequestInput = z.input<typeof approveRequestSchema>;
export type RejectRequestInput = z.input<typeof rejectRequestSchema>;
export type CancelRequestInput = z.input<typeof cancelRequestSchema>;
export type AssignRequestInput = z.input<typeof assignRequestSchema>;

export type RequestCommandResponse = {
  success: boolean;
  error?: string;
  request?: RequestDto;
};

async function requireSessionUser() {
  const session = await getSessionServer();
  if (!session.isAuthenticated || !session.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createRequestServer(
  data: CreateRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = createRequestSchema.parse(data);

    const user = await userManagementService.findUserById(currentUser.id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const request = await workflowService.createRequest(user, {
      title: validated.title,
      description: validated.description,
      type: validated.type,
      priority: validated.priority,
      assigneeId: validated.assigneeId,
    });

    return {
      success: true,
      request: mapRequestToDto(request),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create request",
    };
  }
}

export async function updateRequestServer(
  data: UpdateRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = updateRequestSchema.parse(data);

    const user = await userManagementService.findUserById(currentUser.id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const request = await workflowService.updateRequest(
      validated.requestId,
      user,
      {
        title: validated.title,
        description: validated.description,
        type: validated.type,
        priority: validated.priority,
      }
    );

    return {
      success: true,
      request: mapRequestToDto(request),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update request",
    };
  }
}

export async function submitRequestServer(
  data: SubmitRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = submitRequestSchema.parse(data);

    const user = await userManagementService.findUserById(currentUser.id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const request = await workflowService.submitRequest(
      validated.requestId,
      user
    );

    return {
      success: true,
      request: mapRequestToDto(request),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit request",
    };
  }
}

export async function reviewRequestServer(
  data: ReviewRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = reviewRequestSchema.parse(data);

    const reviewer = await userManagementService.findUserById(currentUser.id);
    if (!reviewer) {
      return { success: false, error: "User not found" };
    }

    const request = await approvalService.startReview(
      validated.requestId,
      reviewer
    );

    return {
      success: true,
      request: mapRequestToDto(request),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start review",
    };
  }
}

export async function approveRequestServer(
  data: ApproveRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = approveRequestSchema.parse(data);

    const approver = await userManagementService.findUserById(currentUser.id);
    if (!approver) {
      return { success: false, error: "User not found" };
    }

    const request = await approvalService.approveRequest(
      validated.requestId,
      approver,
      validated.comments
    );

    return {
      success: true,
      request: mapRequestToDto(request),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to approve request",
    };
  }
}

export async function rejectRequestServer(
  data: RejectRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = rejectRequestSchema.parse(data);

    const reviewer = await userManagementService.findUserById(currentUser.id);
    if (!reviewer) {
      return { success: false, error: "User not found" };
    }

    const request = await approvalService.rejectRequest(
      validated.requestId,
      reviewer,
      validated.reason
    );

    return {
      success: true,
      request: mapRequestToDto(request),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reject request",
    };
  }
}

export async function cancelRequestServer(
  data: CancelRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = cancelRequestSchema.parse(data);

    const user = await userManagementService.findUserById(currentUser.id);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const request = await workflowService.cancelRequest(
      validated.requestId,
      user,
      validated.reason || "Cancelled by user"
    );

    return {
      success: true,
      request: mapRequestToDto(request),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to cancel request",
    };
  }
}

export async function assignRequestServer(
  data: AssignRequestInput
): Promise<RequestCommandResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = assignRequestSchema.parse(data);

    const actor = await userManagementService.findUserById(currentUser.id);
    if (!actor) {
      return { success: false, error: "User not found" };
    }

    const request = await workflowService.assignRequest(
      validated.requestId,
      actor,
      validated.assigneeId
    );

    return {
      success: true,
      request: mapRequestToDto(request),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to assign request",
    };
  }
}
