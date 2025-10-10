import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Request | Request & Approval System',
  description: 'Draft a new request and submit it for approval.',
}

export default function NewRequestLayout({
  children,
}: LayoutProps<'/requests/new'>) {
  return <div className="px-6 py-8">{children}</div>
}
