import { Specification } from '../../shared/specification'
import { Request } from '../request'
import { RequestPriority, RequestStatus } from '../request-status'

/**
 * Specification to identify urgent requests that need attention
 */
export class UrgentRequestSpecification extends Specification<Request> {
  isSatisfiedBy(request: Request): boolean {
    // Urgent priority requests
    if (request.getPriority() === RequestPriority.URGENT) {
      return true
    }

    // High priority requests that have been submitted more than 24 hours ago
    if (
      request.getPriority() === RequestPriority.HIGH &&
      request.getStatus() === RequestStatus.SUBMITTED
    ) {
      const submittedAt = request.getSubmittedAt()
      if (submittedAt) {
        const hoursSinceSubmission =
          (Date.now() - submittedAt.getTime()) / (1000 * 60 * 60)
        return hoursSinceSubmission > 24
      }
    }

    return false
  }
}
