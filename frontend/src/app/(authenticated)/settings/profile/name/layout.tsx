import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile Name | Request & Approval System',
  description: 'Update your display name and related profile details.',
}

export default function ProfileNameLayout({
  children,
}: LayoutProps<'/settings/profile/name'>) {
  return <div className="space-y-6 px-6 py-8">{children}</div>
}
