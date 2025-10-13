import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Change Requested | Request & Approval System',
  description:
    'Review the next steps after requesting an email change for your account.',
}

export default function EmailChangeRequestedLayout({
  children,
}: LayoutProps<'/auth/email-change/requested'>) {
  return <div className="px-6 py-8">{children}</div>
}
