import { AuthenticatedLayoutWrapper } from '@/shared/components/layout/server/AuthenticatedLayoutWrapper'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ダッシュボード | Request & Approval System',
  description:
    '認証済みユーザー向けのリクエスト・承認ワークスペースです。最新のステータスやアクションを確認できます。',
}

export default function AuthenticatedLayout(props: LayoutProps<'/'>) {
  return (
    <AuthenticatedLayoutWrapper>{props.children}</AuthenticatedLayoutWrapper>
  )
}
