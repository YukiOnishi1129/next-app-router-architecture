import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Password Reset | Request & Approval System',
  description: 'Start the password reset flow for your account.',
}

export default function PasswordResetLayout({
  children,
}: LayoutProps<'/password-reset'>) {
  return <div className="mx-auto max-w-md space-y-6 px-6 py-10">{children}</div>
}
