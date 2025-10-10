import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Request & Approval System',
  description: 'Review the service terms and policies.',
}

export default function TermsLayout({ children }: LayoutProps<'/terms'>) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">{children}</div>
  )
}
