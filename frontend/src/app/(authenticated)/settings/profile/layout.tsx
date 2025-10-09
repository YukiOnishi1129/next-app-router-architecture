import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プロフィール設定 | Request & Approval System',
  description:
    'ユーザー情報、メールアドレスなどプロフィール設定を編集できます。',
}

export default function SettingsProfileLayout({
  children,
}: LayoutProps<'/settings/profile'>) {
  return <div className="space-y-6 px-6 py-8">{children}</div>
}
