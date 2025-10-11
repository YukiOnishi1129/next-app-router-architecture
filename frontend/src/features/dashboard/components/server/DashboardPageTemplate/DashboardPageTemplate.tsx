import { Card } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'

import { RequestStatus } from '@/external/domain/request/request-status'
import { getRequestSummaryServer } from '@/external/handler/request/query.server'

export async function DashboardPageTemplate() {
  const requestSummary = await getRequestSummaryServer()

  if (!requestSummary.success || !requestSummary.summary) {
    throw new Error(requestSummary.error ?? 'Failed to load dashboard summary')
  }

  const summaryByStatus = new Map(
    requestSummary.summary.byStatus.map((entry) => [entry.status, entry.count])
  )

  const stats = [
    { label: 'Draft requests', status: RequestStatus.DRAFT },
    { label: 'Submitted', status: RequestStatus.SUBMITTED },
    { label: 'Approved', status: RequestStatus.APPROVED },
  ].map((item) => ({
    ...item,
    value: summaryByStatus.get(item.status) ?? 0,
  }))

  return (
    <section className="space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Quick snapshot of your request pipeline and upcoming tasks.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label} className="space-y-3 p-4">
            <p className="text-muted-foreground text-xs uppercase">
              {item.label}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-semibold">{item.value}</span>
              <RequestStatusBadge status={item.status} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
