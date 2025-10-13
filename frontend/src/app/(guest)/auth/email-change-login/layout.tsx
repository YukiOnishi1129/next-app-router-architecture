import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Change Login | Request & Approval System',
  description:
    'Re-authenticate with your updated email to finish linking your account.',
}

export default function EmailChangeLoginLayout({
  children,
}: LayoutProps<'/auth/email-change-login'>) {
  return <div className="mx-auto max-w-md py-10">{children}</div>
}
