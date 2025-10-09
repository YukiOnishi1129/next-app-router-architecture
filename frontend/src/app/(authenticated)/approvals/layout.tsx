import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '承認キュー | Request & Approval System',
  description: '担当するリクエストの承認・却下を管理します。',
}

export default function ApprovalsLayout({
  children,
}: LayoutProps<'/approvals'>) {
  return <div className="px-6 py-8">{children}</div>
}
