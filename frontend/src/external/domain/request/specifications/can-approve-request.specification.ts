import { Account, AccountRole } from '../../account'
import { Specification } from '../../shared/specification'
import { Request } from '../request'

/**
 * Specification to check if an account can approve a request
 */
export class CanApproveRequestSpecification extends Specification<{
  request: Request
  account: Account
}> {
  isSatisfiedBy(candidate: { request: Request; account: Account }): boolean {
    const { request, account } = candidate

    // Account must be active
    if (!account.isActive()) {
      return false
    }

    // Account must have admin role
    if (!account.hasRole(AccountRole.ADMIN)) {
      return false
    }

    // Request must be in review
    if (!request.isInReview()) {
      return false
    }

    // Account cannot approve their own request
    if (request.getRequesterId().equals(account.getId())) {
      return false
    }

    return true
  }
}
