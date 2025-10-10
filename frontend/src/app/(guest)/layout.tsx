import { GuestLayoutWrapper } from '@/shared/components/layout/server/GuestLayoutWrapper'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guest Area | Request & Approval System',
  description:
    'Access public pages such as the marketing overview and sign-in.',
}

export default function GuestLayout(props: LayoutProps<'/'>) {
  return <GuestLayoutWrapper>{props.children}</GuestLayoutWrapper>
}
