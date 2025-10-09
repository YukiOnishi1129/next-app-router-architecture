import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Features/Auth/SignOutButton',
  parameters: {
    docs: {
      description: {
        component: `
Container コンポーネントは SignOut 用の Mutation Hook を呼び出し、Presenter に状態を渡す薄いラッパーです。
- **SignOutButtonContainer.tsx**: Hook 呼び出しと Presenter の結線
- **useSignOutButton.ts**: サインアウト処理（TanStack Mutation + Router 連携）
- **SignOutButtonPresenter.tsx**: UI ボタン
        `,
      },
    },
  },
}

export default meta

type Story = StoryObj

export const Documentation: Story = {
  render: () => (
    <div className="bg-card rounded-lg border p-6 text-sm">
      <p>Presenter ストーリーで UI 状態を確認してください。</p>
    </div>
  ),
}
