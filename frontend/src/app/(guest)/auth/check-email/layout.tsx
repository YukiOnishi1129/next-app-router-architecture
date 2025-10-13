import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check Email | Request & Approval System',
  description: 'Follow the email instructions to continue signing up.',
}

export default function CheckEmailLayout({
  children,
}: LayoutProps<'/auth/check-email'>) {
  return <div className="mx-auto max-w-md py-10">{children}</div>
}
