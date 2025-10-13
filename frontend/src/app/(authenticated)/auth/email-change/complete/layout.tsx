import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Change Complete | Request & Approval System',
  description: 'Your email address has been updated successfully.',
}

export default function EmailChangeCompleteLayout({
  children,
}: LayoutProps<'/auth/email-change/complete'>) {
  return <div className="px-6 py-8">{children}</div>
}
