export const approvalKeys = {
  all: ['approvals'] as const,
  pending: () => [...approvalKeys.all, 'pending'] as const,
  history: (status: 'APPROVED' | 'REJECTED') =>
    [...approvalKeys.all, 'history', status] as const,
}
