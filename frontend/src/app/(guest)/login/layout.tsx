import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Request & Approval System',
  description: 'Sign in to access the request and approval workspace.',
}

export default function LoginLayout({ children }: LayoutProps<'/login'>) {
  return <div className="mx-auto max-w-md py-10">{children}</div>
}
