import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request List | Request & Approval System',
  description: 'Browse, filter, and search submitted requests.',
}

export default function RequestsLayout({ children }: LayoutProps<'/requests'>) {
  return <div className="px-6 py-8">{children}</div>
}
