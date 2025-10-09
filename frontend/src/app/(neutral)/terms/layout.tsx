import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 | Request & Approval System',
  description: 'サービス利用規約を確認できます。',
}

export default function TermsLayout({ children }: LayoutProps<'/terms'>) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">{children}</div>
  )
}
