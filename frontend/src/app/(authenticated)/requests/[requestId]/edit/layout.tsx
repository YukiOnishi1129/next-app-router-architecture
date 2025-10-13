import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Request | Request & Approval System',
  description: 'Update request details before resubmitting for approval.',
}

export default function RequestEditLayout({
  children,
}: LayoutProps<'/requests/[requestId]/edit'>) {
  return <div className="px-6 py-8">{children}</div>
}
