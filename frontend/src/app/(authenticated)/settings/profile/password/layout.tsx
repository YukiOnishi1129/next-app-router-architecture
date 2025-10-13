import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile Password | Request & Approval System',
  description: 'Change your password to keep your account secure.',
}

export default function ProfilePasswordLayout({
  children,
}: LayoutProps<'/settings/profile/password'>) {
  return <div className="space-y-6 px-6 py-8">{children}</div>
}
