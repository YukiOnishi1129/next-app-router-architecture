import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'リクエスト詳細 | Request & Approval System',
  description: '個別のリクエスト内容や履歴、コメントを確認できます。',
}

export default function RequestDetailLayout({
  children,
}: LayoutProps<'/requests/[requestId]'>) {
  return <div className="px-6 py-8">{children}</div>
}
