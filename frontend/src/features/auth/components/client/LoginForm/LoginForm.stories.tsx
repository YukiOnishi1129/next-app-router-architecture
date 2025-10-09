import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Features/Auth/LoginForm',
  parameters: {
    docs: {
      description: {
        component: `
## Overview
ログインフォームの Container コンポーネントです。Presenter と Hook の構造は features/settings のフォームと同様に三層で構成されています。

## Architecture
- **LoginForm.tsx**: Container のエントリーポイント
- **LoginFormContainer.tsx**: Hook を呼び出して Presenter に渡す薄いラッパー
- **useLoginForm.ts**: react-hook-form + TanStack Query を使用したビジネスロジック
- **LoginFormPresenter.tsx**: UI レイヤー（入力フィールド、バリデーションメッセージ等）
- **hooks/useLoginMutation.ts**: サインイン Server Action を呼び出すカスタムフック

## Testing
- `LoginForm.test.tsx`: Container の描画テスト
- `useLoginForm.test.ts`: Hook の振る舞いテスト
        `,
      },
    },
  },
}

export default meta

type Story = StoryObj

export const Documentation: Story = {
  render: () => (
    <div className="space-y-3 rounded-lg border bg-card p-6 text-sm">
      <h3 className="text-lg font-semibold">LoginForm (Container)</h3>
      <p>
        Storybook では Presenter のパターンを確認してください。
      </p>
    </div>
  ),
}
