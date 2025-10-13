import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Approvals History | Request & Approval System',
  description: 'See previously reviewed requests and their outcomes.',
}

export default function ApprovalsHistoryLayout({
  children,
}: LayoutProps<'/approvals/history'>) {
  return <div className="px-6 py-8">{children}</div>
}
