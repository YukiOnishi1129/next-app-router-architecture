import { NeutralLayoutWrapper } from '@/shared/components/layout/server/NeutralLayoutWrapper'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Information Pages | Request & Approval System',
  description:
    'Shared informational pages such as terms of service and password reset.',
}

export default function NeutralLayout(props: LayoutProps<'/'>) {
  return <NeutralLayoutWrapper>{props.children}</NeutralLayoutWrapper>
}
