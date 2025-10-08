'use client'

import { Badge } from '@/shared/components/ui/badge'

import type { ComponentProps } from 'react'

type RequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

const STATUS_VARIANTS: Record<
  RequestStatus,
  ComponentProps<typeof Badge>['variant']
> = {
  draft: 'outline',
  submitted: 'default',
  approved: 'success',
  rejected: 'destructive',
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
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
