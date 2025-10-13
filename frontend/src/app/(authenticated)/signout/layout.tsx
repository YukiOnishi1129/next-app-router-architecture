import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Out | Request & Approval System',
  description: 'Confirm sign-out and securely end your session.',
}

export default function SignOutLayout({
  children,
}: LayoutProps<'/signout'>) {
  return <div className="px-6 py-8">{children}</div>
}
