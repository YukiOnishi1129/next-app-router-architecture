import type { Metadata } from 'next'

import { NeutralLayoutWrapper } from '@/shared/components/layout/server/NeutralLayoutWrapper'

export const metadata: Metadata = {
  title: '情報ページ | Request & Approval System',
  description: '利用規約やパスワードリセットなど、共通情報ページを提供します。',
}

export default function NeutralLayout(props: LayoutProps<'/'>) {
  return <NeutralLayoutWrapper>{props.children}</NeutralLayoutWrapper>
}
