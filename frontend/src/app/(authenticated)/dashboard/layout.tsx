import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Request & Approval System',
  description: 'View a snapshot of request and approval activity.',
}

export default function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  return <div className="px-6 py-8">{children}</div>
}
