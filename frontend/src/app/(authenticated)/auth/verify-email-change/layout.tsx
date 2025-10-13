import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Email Change | Request & Approval System',
  description: 'Confirm your new email address to finish updating your account.',
}

export default function VerifyEmailChangeLayout({
  children,
}: LayoutProps<'/auth/verify-email-change'>) {
  return <div className="px-6 py-8">{children}</div>
}
