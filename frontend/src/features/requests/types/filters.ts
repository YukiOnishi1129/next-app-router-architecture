export type RequestFilterInput = {
  status?: "draft" | "submitted" | "approved" | "rejected";
  type?: "expense" | "purchase" | "access";
  mineOnly?: boolean;
  pendingApprovalsOnly?: boolean;
};
