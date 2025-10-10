import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'

import { RequestStatus } from '@/external/domain/request/request-status'

const MOCK_APPROVALS = [
  {
    id: 'approval-001',
    title: 'Marketing campaign budget',
    requester: 'Alicia Chen',
    submittedAt: new Date().toISOString(),
  },
  {
    id: 'approval-002',
    title: 'Production database access',
    requester: 'Jonah Patel',
    submittedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
]

export async function PendingApprovalsPageTemplate() {
  return (
    <section className="space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Pending approvals</h1>
        <p className="text-muted-foreground text-sm">
          Review and take action on requests awaiting your decision.
        </p>
      </header>

      <div className="grid gap-3">
        {MOCK_APPROVALS.map((item) => (
          <article
            key={item.id}
            className="border-border bg-background rounded-md border px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium">{item.title}</h2>
                <p className="text-muted-foreground text-xs">
                  Requested by {item.requester} on{' '}
                  {new Date(item.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <RequestStatusBadge status={RequestStatus.SUBMITTED} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
