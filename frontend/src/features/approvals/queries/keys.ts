export const approvalKeys = {
  all: ['approvals'] as const,
  pending: () => [...approvalKeys.all, 'pending'] as const,
}
