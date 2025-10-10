import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile Settings | Request & Approval System',
  description: 'Update your account information and profile preferences.',
}

export default function SettingsProfileLayout({
  children,
}: LayoutProps<'/settings/profile'>) {
  return <div className="space-y-6 px-6 py-8">{children}</div>
}
