import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications | Request & Approval System',
  description: 'Review alerts and updates across your requests and approvals.',
}

export default function NotificationsLayout({
  children,
}: LayoutProps<'/notifications'>) {
  return <div className="px-6 py-8">{children}</div>
}
