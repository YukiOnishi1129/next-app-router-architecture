import "server-only";

import { z } from "zod";

import { UserId } from "@/external/domain";

import {
  requestRepository,
  userManagementService,
  mapRequestToDto,
} from "./shared";
import { getSessionServer } from "../auth/query.server";

import type { RequestDto } from "./shared";

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type RequestListInput = z.input<typeof paginationSchema>;

export type RequestListResponse = {
  success: boolean;
  error?: string;
  requests?: RequestDto[];
  total?: number;
  limit?: number;
  offset?: number;
};

async function requireSessionUser() {
  const session = await getSessionServer();
  if (!session.isAuthenticated || !session.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function listMyRequestsServer(
  params?: RequestListInput
): Promise<RequestListResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = paginationSchema.parse(params ?? {});

    const requesterId = UserId.create(currentUser.id);
    const requests = await requestRepository.findByRequesterId(
      requesterId,
      validated.limit,
      validated.offset
    );

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
      total: requests.length,
      limit: validated.limit,
      offset: validated.offset,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list requests",
    };
  }
}

export async function listAssignedRequestsServer(
  params?: RequestListInput
): Promise<RequestListResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = paginationSchema.parse(params ?? {});

    const assigneeId = UserId.create(currentUser.id);
    const requests = await requestRepository.findByAssigneeId(
      assigneeId,
      validated.limit,
      validated.offset
    );

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
      total: requests.length,
      limit: validated.limit,
      offset: validated.offset,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to list assigned requests",
    };
  }
}

export async function listAllRequestsServer(
  params?: RequestListInput
): Promise<RequestListResponse> {
  try {
    const currentUser = await requireSessionUser();
    const validated = paginationSchema.parse(params ?? {});

    const user = await userManagementService.findUserById(currentUser.id);
    if (!user || !user.isAdmin()) {
      return { success: false, error: "Insufficient permissions" };
    }

    const requests = await requestRepository.findAll(
      validated.limit,
      validated.offset
    );

    return {
      success: true,
      requests: requests.map(mapRequestToDto),
      total: requests.length,
      limit: validated.limit,
      offset: validated.offset,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data" };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list requests",
    };
  }
}
