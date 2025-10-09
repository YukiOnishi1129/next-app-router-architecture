import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign up | Request & Approval System',
  description:
    'Create an account to start submitting requests and collaborating with approvers.',
}

export default function SignupLayout({ children }: LayoutProps<'/signup'>) {
  return <div className="mx-auto max-w-md py-10">{children}</div>
}
