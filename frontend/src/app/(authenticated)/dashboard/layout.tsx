import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ダッシュボード | Request & Approval System',
  description: 'リクエスト・承認状況のスナップショットを表示します。',
}

export default function DashboardLayout({
  children,
}: LayoutProps<'/dashboard'>) {
  return <div className="px-6 py-8">{children}</div>
}
