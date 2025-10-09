import { GuestLayoutWrapper } from '@/shared/components/layout/server/GuestLayoutWrapper'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ゲストエリア | Request & Approval System',
  description:
    '公開ページにアクセスして、リクエスト管理アプリの概要やログインページへ移動できます。',
}

export default function GuestLayout(props: LayoutProps<'/'>) {
  return <GuestLayoutWrapper>{props.children}</GuestLayoutWrapper>
}
