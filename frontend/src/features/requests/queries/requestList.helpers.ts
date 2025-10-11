import type {
  RequestDetailResponse,
  RequestDto,
  RequestListInput,
  RequestListResponse,
} from '@/external/dto/request'
import type {
  RequestDetail,
  RequestFilterInput,
  RequestSummary,
} from '@/features/requests/types'

const DEFAULT_LIMIT = 50

export type RequestListResult = {
  requests: RequestDto[]
  total: number
  limit: number
  offset: number
}

export type RequestListFetcher = (
  params?: RequestListInput
) => Promise<RequestListResponse>

type RequestListFetchers = {
  listMine: RequestListFetcher
  listAssigned: RequestListFetcher
  listAll: RequestListFetcher
}

export function selectRequestListFetcher(
  filters: RequestFilterInput,
  fetchers: RequestListFetchers
): RequestListFetcher {
  const baseFetcher = filters.pendingApprovalsOnly
    ? fetchers.listAssigned
    : filters.mineOnly === false
      ? fetchers.listAll
      : fetchers.listMine

  return (params?: RequestListInput) => {
    const finalParams: RequestListInput | undefined = (() => {
      const merged = {
        ...(params ?? {}),
        ...(filters.status ? { status: filters.status } : {}),
      }

      return Object.keys(merged).length > 0 ? merged : undefined
    })()

    return baseFetcher(finalParams)
  }
}

export function ensureRequestListResponse(
  response: RequestListResponse
): RequestListResult {
  if (!response.success || !response.requests) {
    throw new Error(response.error ?? 'Failed to load requests')
  }

  return {
    requests: response.requests,
    total: response.total ?? response.requests.length,
    limit: response.limit ?? DEFAULT_LIMIT,
    offset: response.offset ?? 0,
  }
}

export function mapRequestDtoToSummary(request: RequestDto): RequestSummary {
  return {
    id: request.id,
    title: request.title,
    status: request.status,
    type: request.type,
    priority: request.priority,
    createdAt: request.createdAt,
    submittedAt: request.submittedAt ?? null,
  }
}

export function ensureRequestDetailResponse(
  response: RequestDetailResponse
): RequestDto {
  if (!response.success || !response.request) {
    throw new Error(response.error ?? 'Failed to load request detail')
  }
  return response.request
}

export function mapRequestDtoToDetail(request: RequestDto): RequestDetail {
  return {
    id: request.id,
    title: request.title,
    description: request.description,
    status: request.status,
    type: request.type,
    priority: request.priority,
    requesterId: request.requesterId,
    requesterName: request.requesterName ?? null,
    assigneeId: request.assigneeId ?? null,
    assigneeName: request.assigneeName ?? null,
    reviewerId: request.reviewerId ?? null,
    reviewerName: request.reviewerName ?? null,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    submittedAt: request.submittedAt ?? null,
    reviewedAt: request.reviewedAt ?? null,
  }
}
