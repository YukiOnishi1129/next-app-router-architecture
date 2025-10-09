import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン | Request & Approval System',
  description:
    'アカウントにサインインして、リクエストや承認ワークスペースにアクセスします。',
}

export default function LoginLayout({ children }: LayoutProps<'/login'>) {
  return <div className="mx-auto max-w-md py-10">{children}</div>
}
