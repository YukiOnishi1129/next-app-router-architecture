import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Email | Request & Approval System',
  description:
    'Confirm your email address to activate access to the workspace.',
}

export default function VerifyEmailLayout({
  children,
}: LayoutProps<'/auth/verify'>) {
  return <div className="mx-auto max-w-md py-10">{children}</div>
}
