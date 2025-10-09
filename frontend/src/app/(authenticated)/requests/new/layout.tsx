import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'リクエスト作成 | Request & Approval System',
  description: '新しいリクエストを作成して承認フローに回します。',
}

export default function NewRequestLayout({
  children,
}: LayoutProps<'/requests/new'>) {
  return <div className="px-6 py-8">{children}</div>
}
