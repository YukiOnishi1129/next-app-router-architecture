'use server';

import { z } from 'zod';
import { RequestWorkflowService } from '@/external/service/RequestWorkflowService';
import { RequestApprovalService } from '@/external/service/RequestApprovalService';
import { RequestRepository, UserRepository } from '@/external/domain';
import { NotificationService } from '@/external/service/NotificationService';
import { AuditService } from '@/external/service/AuditService';
import { getSession } from './auth';
import { RequestType, RequestPriority, RequestStatus } from '@/external/domain/request/request-status';

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

// Response types
export type RequestResponse = {
  success: boolean;
  error?: string;
  request?: {
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
};

export type RequestListResponse = {
  success: boolean;
  error?: string;
  requests?: Array<RequestResponse['request']>;
  total?: number;
};

// Initialize services
const requestRepository = new RequestRepository();
const userRepository = new UserRepository();
const notificationService = new NotificationService();
const auditService = new AuditService();
const workflowService = new RequestWorkflowService(
  requestRepository,
  notificationService,
  auditService
);
const approvalService = new RequestApprovalService(
  requestRepository,
  userRepository,
  notificationService,
  auditService
);

/**
 * Create a new request
 */
export async function createRequest(data: unknown): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const validated = createRequestSchema.parse(data);
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const request = await workflowService.createRequest(user, {
      title: validated.title,
      description: validated.description,
      category: validated.type as any, // Type mismatch between service and domain
      priority: validated.priority as any,
      metadata: validated.assigneeId ? { assigneeId: validated.assigneeId } : undefined,
    });
    
    return {
      success: true,
      request: request.toJSON() as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create request',
    };
  }
}

/**
 * Update a request
 */
export async function updateRequest(data: unknown): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const validated = updateRequestSchema.parse(data);
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const request = await workflowService.updateRequest(
      validated.requestId,
      user,
      {
        title: validated.title,
        description: validated.description,
        category: validated.type as any,
        priority: validated.priority as any,
      }
    );
    
    return {
      success: true,
      request: request.toJSON() as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update request',
    };
  }
}

/**
 * Submit a request for approval
 */
export async function submitRequest(data: unknown): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const validated = submitRequestSchema.parse(data);
    const request = await requestRepository.findById(validated.requestId);
    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      };
    }
    
    // Verify ownership
    if (request.getRequesterId().getValue() !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    request.submit();
    await requestRepository.save(request);
    
    // Send notifications
    await notificationService.notifyRequestSubmitted(request);
    
    return {
      success: true,
      request: request.toJSON() as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit request',
    };
  }
}

/**
 * Start reviewing a request
 */
export async function reviewRequest(data: unknown): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const validated = reviewRequestSchema.parse(data);
    const reviewer = await userRepository.findById(session.user.id);
    if (!reviewer) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const request = await approvalService.startReview(
      validated.requestId,
      reviewer
    );
    
    return {
      success: true,
      request: request.toJSON() as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start review',
    };
  }
}

/**
 * Approve a request
 */
export async function approveRequest(data: unknown): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const validated = approveRequestSchema.parse(data);
    const approver = await userRepository.findById(session.user.id);
    if (!approver) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const request = await approvalService.approveRequest(
      validated.requestId,
      approver,
      validated.comments
    );
    
    return {
      success: true,
      request: request.toJSON() as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve request',
    };
  }
}

/**
 * Reject a request
 */
export async function rejectRequest(data: unknown): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const validated = rejectRequestSchema.parse(data);
    const reviewer = await userRepository.findById(session.user.id);
    if (!reviewer) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const request = await approvalService.rejectRequest(
      validated.requestId,
      reviewer,
      validated.reason
    );
    
    return {
      success: true,
      request: request.toJSON() as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject request',
    };
  }
}

/**
 * Cancel a request
 */
export async function cancelRequest(data: unknown): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const validated = cancelRequestSchema.parse(data);
    const user = await userRepository.findById(session.user.id);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const request = await workflowService.cancelRequest(
      validated.requestId,
      user,
      validated.reason || 'Cancelled by user'
    );
    
    return {
      success: true,
      request: request.toJSON() as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel request',
    };
  }
}

/**
 * Assign a request to a user
 */
export async function assignRequest(data: unknown): Promise<RequestResponse> {
  try {
    const session = await getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const validated = assignRequestSchema.parse(data);
    const request = await requestRepository.findById(validated.requestId);
    if (!request) {
      return {
        success: false,
        error: 'Request not found',
      };
    }
    
    // Check permissions
    const user = await userRepository.findById(session.user.id);
    if (!user || !user.isAdmin()) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    request.assignTo(validated.assigneeId);
    await requestRepository.save(request);
    
    // Send notification to assignee
    const assignee = await userRepository.findById(validated.assigneeId);
    if (assignee) {
      await notificationService.notifyAssignment(request, assignee);
    }
    
    return {
      success: true,
      request: request.toJSON() as any,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign request',
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
        error: 'Unauthorized',
      };
    }
    
    const requests = await requestRepository.findByRequesterId(session.user.id);
    
    return {
      success: true,
      requests: requests.map(r => r.toJSON() as any),
      total: requests.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get requests',
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
        error: 'Unauthorized',
      };
    }
    
    const requests = await requestRepository.findByAssigneeId(session.user.id);
    
    return {
      success: true,
      requests: requests.map(r => r.toJSON() as any),
      total: requests.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get requests',
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
        error: 'Unauthorized',
      };
    }
    
    // Check admin permission
    const user = await userRepository.findById(session.user.id);
    if (!user || !user.isAdmin()) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
    
    const requests = await requestRepository.findAll();
    
    return {
      success: true,
      requests: requests.map(r => r.toJSON() as any),
      total: requests.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get requests',
    };
  }
}