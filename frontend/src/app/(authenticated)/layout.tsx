import { AuthenticatedLayoutWrapper } from '@/shared/components/layout/server/AuthenticatedLayoutWrapper'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Request & Approval System',
  description:
    'Workspace for authenticated users to review requests, approvals, and recent activity.',
}

export default function AuthenticatedLayout(props: LayoutProps<'/'>) {
  return (
    <AuthenticatedLayoutWrapper>{props.children}</AuthenticatedLayoutWrapper>
  )
}
