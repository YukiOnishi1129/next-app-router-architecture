import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パスワードリセット | Request & Approval System',
  description: 'パスワードリセット手続きを行います。',
}

export default function PasswordResetLayout({
  children,
}: LayoutProps<'/password-reset'>) {
  return <div className="mx-auto max-w-md space-y-6 px-6 py-10">{children}</div>
}
