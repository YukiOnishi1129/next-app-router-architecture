"use server";

import { z } from "zod";
import { RequestWorkflowService } from "@/external/service/RequestWorkflowService";
import { RequestApprovalService } from "@/external/service/RequestApprovalService";
import { NotificationService } from "@/external/service/NotificationService";
import { AuditService } from "@/external/service/AuditService";
import { UserManagementService } from "@/external/service";
import { getSession } from "./auth";
import {
  RequestType,
  RequestPriority,
  RequestStatus,
} from "@/external/domain/request/request-status";
import { Request } from "@/external/domain";

// Validation schemas
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

type CreateRequestInput = z.input<typeof createRequestSchema>;
type UpdateRequestInput = z.input<typeof updateRequestSchema>;
type SubmitRequestInput = z.input<typeof submitRequestSchema>;
type ReviewRequestInput = z.input<typeof reviewRequestSchema>;
type ApproveRequestInput = z.input<typeof approveRequestSchema>;
type RejectRequestInput = z.input<typeof rejectRequestSchema>;
type CancelRequestInput = z.input<typeof cancelRequestSchema>;
type AssignRequestInput = z.input<typeof assignRequestSchema>;

// Response types
type RequestDto = {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  priority: RequestPriority;
  status: RequestStatus;
  requesterId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
};

export type RequestResponse = {
  success: boolean;
  error?: string;
  request?: RequestDto;
};

export type RequestListResponse = {
  success: boolean;
  error?: string;
  requests?: Array<RequestDto>;
  total?: number;
};

function mapRequestToDto(request: Request): RequestDto {
  return {
    id: request.getId().getValue(),
    title: request.getTitle(),
    description: request.getDescription(),
    type: request.getType(),
    priority: request.getPriority(),
    status: request.getStatus(),
    requesterId: request.getRequesterId().getValue(),
    assigneeId: request.getAssigneeId()?.getValue(),
    createdAt: request.getCreatedAt().toISOString(),
    updatedAt: request.getUpdatedAt().toISOString(),
    submittedAt: request.getSubmittedAt()?.toISOString() ?? undefined,
    reviewedAt: request.getReviewedAt()?.toISOString() ?? undefined,
    reviewerId: request.getReviewerId()?.getValue() ?? undefined,
  };
}

// Initialize services
const notificationService = new NotificationService();
const auditService = new AuditService();
const userService = new UserManagementService();
const workflowService = new RequestWorkflowService(
  notificationService,
  auditService
);
const approvalService = new RequestApprovalService(
  notificationService,
  auditService
);

/**
 * Create a new request
 */
export async function createRequest(
  data: CreateRequestInput
): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = createRequestSchema.parse(data);
    const user = await userService.findUserById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
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
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create request",
    };
  }
}

/**
 * Update a request
 */
export async function updateRequest(
  data: UpdateRequestInput
): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = updateRequestSchema.parse(data);
    const user = await userService.findUserById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
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
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update request",
    };
  }
}

/**
 * Submit a request for approval
 */
export async function submitRequest(
  data: SubmitRequestInput
): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = submitRequestSchema.parse(data);
    const user = await userService.findUserById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
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
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit request",
    };
  }
}

/**
 * Start reviewing a request
 */
export async function reviewRequest(
  data: ReviewRequestInput
): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = reviewRequestSchema.parse(data);
    const reviewer = await userService.findUserById(session.user.id);
    if (!reviewer) {
      return {
        success: false,
        error: "User not found",
      };
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
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start review",
    };
  }
}

/**
 * Approve a request
 */
export async function approveRequest(
  data: ApproveRequestInput
): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = approveRequestSchema.parse(data);
    const approver = await userService.findUserById(session.user.id);
    if (!approver) {
      return {
        success: false,
        error: "User not found",
      };
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
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to approve request",
    };
  }
}

/**
 * Reject a request
 */
export async function rejectRequest(
  data: RejectRequestInput
): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = rejectRequestSchema.parse(data);
    const reviewer = await userService.findUserById(session.user.id);
    if (!reviewer) {
      return {
        success: false,
        error: "User not found",
      };
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
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reject request",
    };
  }
}

/**
 * Cancel a request
 */
export async function cancelRequest(
  data: CancelRequestInput
): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = cancelRequestSchema.parse(data);
    const user = await userService.findUserById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
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
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to cancel request",
    };
  }
}

/**
 * Assign a request to a user
 */
export async function assignRequest(
  data: AssignRequestInput
): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validated = assignRequestSchema.parse(data);
    const actor = await userService.findUserById(session.user.id);
    if (!actor) {
      return {
        success: false,
        error: "User not found",
      };
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
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to assign request",
    };
  }
}

/**
 * Get requests for current user
 */
export async function getMyRequests(): Promise<RequestListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const requests = await workflowService.getRequestsForRequester(
      session.user.id
    );

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
      total: requests.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get requests",
    };
  }
}

/**
 * Get requests assigned to current user
 */
export async function getAssignedRequests(): Promise<RequestListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const requests = await workflowService.getRequestsForAssignee(
      session.user.id
    );

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
      total: requests.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get requests",
    };
  }
}

/**
 * Get all requests (admin only)
 */
export async function getAllRequests(): Promise<RequestListResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check admin permission
    const user = await userService.findUserById(session.user.id);
    if (!user || !user.isAdmin()) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const requests = await workflowService.getAllRequests();

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
      total: requests.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get requests",
    };
  }
}
