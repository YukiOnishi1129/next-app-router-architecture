import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile Email | Request & Approval System',
  description: 'Manage the email address associated with your profile.',
}

export default function ProfileEmailLayout({
  children,
}: LayoutProps<'/settings/profile/email'>) {
  return <div className="space-y-6 px-6 py-8">{children}</div>
}
