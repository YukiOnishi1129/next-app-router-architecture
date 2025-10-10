import type {
  RequestDto,
  RequestListInput,
  RequestListResponse,
} from '@/external/dto/request'
import type {
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
  if (filters.pendingApprovalsOnly) {
    return fetchers.listAssigned
  }

  if (filters.mineOnly === false) {
    return fetchers.listAll
  }

  return fetchers.listMine
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
