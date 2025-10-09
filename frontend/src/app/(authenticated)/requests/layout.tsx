import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'リクエスト一覧 | Request & Approval System',
  description: '作成済みのリクエストを確認し、フィルタリングや検索を行います。',
}

export default function RequestsLayout({ children }: LayoutProps<'/requests'>) {
  return <div className="px-6 py-8">{children}</div>
}
