import Link from 'next/link'

import { Card } from '@/shared/components/ui/card'
import { RequestStatusBadge } from '@/shared/components/ui/request-status-badge'

import { RequestStatus } from '@/external/domain/request/request-status'
import {
  getRequestSummaryServer,
  listPendingApprovalsServer,
} from '@/external/handler/request/query.server'

const linkBaseClasses =
  'group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export async function DashboardPageTemplate() {
  const [requestSummary, pendingApprovals] = await Promise.all([
    getRequestSummaryServer(),
    listPendingApprovalsServer(),
  ])

  if (!requestSummary.success || !requestSummary.summary) {
    throw new Error(requestSummary.error ?? 'Failed to load dashboard summary')
  }

  if (!pendingApprovals.success || !pendingApprovals.requests) {
    throw new Error(
      pendingApprovals.error ?? 'Failed to load pending approvals'
    )
  }

  const summaryByStatus = new Map(
    requestSummary.summary.byStatus.map((entry) => [entry.status, entry.count])
  )

  const myRequestCards = [
    {
      label: 'Draft',
      status: RequestStatus.DRAFT,
      href: '/requests?status=DRAFT' as const,
      description: 'Keep editing before you submit.',
    },
    {
      label: 'Submitted',
      status: RequestStatus.SUBMITTED,
      href: '/requests?status=SUBMITTED' as const,
      description: 'Waiting on approvers.',
    },
    {
      label: 'Approved',
      status: RequestStatus.APPROVED,
      href: '/requests?status=APPROVED' as const,
      description: 'Requests that made it through.',
    },
  ].map((item) => ({
    ...item,
    value: summaryByStatus.get(item.status) ?? 0,
  }))

  const pendingApprovalsCard = {
    label: 'Pending approvals',
    status: RequestStatus.IN_REVIEW,
    href: '/approvals' as const,
    value: pendingApprovals.requests.length,
    description: 'Requests from others waiting for your decision.',
  }

  return (
    <section className="space-y-8 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Jump straight to the requests you created or the approvals you owe.
        </p>
      </header>

      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-foreground text-lg font-medium">My requests</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {myRequestCards.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={linkBaseClasses}
                aria-label={`${item.label} requests`}
              >
                <Card className="space-y-3 p-4 transition group-hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xs uppercase">
                      {item.label}
                    </p>
                    <RequestStatusBadge status={item.status} />
                  </div>
                  <span className="text-3xl font-semibold">{item.value}</span>
                  <p className="text-muted-foreground text-xs">
                    {item.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-foreground text-lg font-medium">
            Approvals assigned to me
          </h2>
          <Link
            href={pendingApprovalsCard.href}
            className={`${linkBaseClasses} max-w-xl`}
            aria-label="Pending approvals"
          >
            <Card className="space-y-3 p-4 transition group-hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs uppercase">
                  {pendingApprovalsCard.label}
                </p>
                <RequestStatusBadge status={pendingApprovalsCard.status} />
              </div>
              <span className="text-3xl font-semibold">
                {pendingApprovalsCard.value}
              </span>
              <p className="text-muted-foreground text-xs">
                {pendingApprovalsCard.description}
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  )
}
