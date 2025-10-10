import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Approval Queue | Request & Approval System',
  description: 'Review and approve or reject requests assigned to you.',
}

export default function ApprovalsLayout({
  children,
}: LayoutProps<'/approvals'>) {
  return <div className="px-6 py-8">{children}</div>
}
