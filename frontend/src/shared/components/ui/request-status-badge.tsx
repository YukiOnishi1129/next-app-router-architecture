'use client'

import { Badge } from '@/shared/components/ui/badge'

import { RequestStatus } from '@/external/domain/request/request-status'

import type { ComponentProps } from 'react'

const STATUS_VARIANTS: Record<
  RequestStatus,
  ComponentProps<typeof Badge>['variant']
> = {
  [RequestStatus.DRAFT]: 'outline',
  [RequestStatus.SUBMITTED]: 'default',
  [RequestStatus.IN_REVIEW]: 'default',
  [RequestStatus.APPROVED]: 'success',
  [RequestStatus.REJECTED]: 'destructive',
  [RequestStatus.CANCELLED]: 'outline',
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.DRAFT]: 'Draft',
  [RequestStatus.SUBMITTED]: 'Submitted',
  [RequestStatus.IN_REVIEW]: 'In Review',
  [RequestStatus.APPROVED]: 'Approved',
  [RequestStatus.REJECTED]: 'Rejected',
  [RequestStatus.CANCELLED]: 'Cancelled',
}

export function RequestStatusBadge({
  status,
  className,
}: {
  status: RequestStatus
  className?: string
}) {
  return (
    <Badge className={className} variant={STATUS_VARIANTS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
