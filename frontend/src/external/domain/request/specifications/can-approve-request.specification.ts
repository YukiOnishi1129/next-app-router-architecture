import { Specification } from "../../shared/specification";
import { Request } from "../request";
import { User, UserRole } from "../../user";

/**
 * Specification to check if a user can approve a request
 */
export class CanApproveRequestSpecification extends Specification<{
  request: Request;
  user: User;
}> {
  isSatisfiedBy(candidate: { request: Request; user: User }): boolean {
    const { request, user } = candidate;

    // User must be active
    if (!user.isActive()) {
      return false;
    }

    // User must have admin role
    if (!user.hasRole(UserRole.ADMIN)) {
      return false;
    }

    // Request must be in review
    if (!request.isInReview()) {
      return false;
    }

    // User cannot approve their own request
    if (request.getRequesterId().equals(user.getId())) {
      return false;
    }

    return true;
  }
}
