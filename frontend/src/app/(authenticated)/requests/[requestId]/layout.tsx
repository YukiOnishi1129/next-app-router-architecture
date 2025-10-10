import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request Detail | Request & Approval System',
  description: 'Inspect request history, attachments, and comments.',
}

export default function RequestDetailLayout({
  children,
}: LayoutProps<'/requests/[requestId]'>) {
  return <div className="px-6 py-8">{children}</div>
}
