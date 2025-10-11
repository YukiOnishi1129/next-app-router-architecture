import type { PendingApprovalDto } from '@/external/dto/request'
import type { PendingApproval } from '@/features/approvals/types'

export const mapPendingApprovalDto = (
  dto: PendingApprovalDto
): PendingApproval => ({
  id: dto.id,
  title: dto.title,
  status: dto.status,
  type: dto.type,
  priority: dto.priority,
  requesterName: dto.requesterName,
  submittedAt: dto.submittedAt,
})
