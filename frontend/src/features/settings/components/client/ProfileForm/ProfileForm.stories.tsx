import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta = {
  title: 'Features/Settings/ProfileForm',
  parameters: {
    docs: {
      description: {
        component: `
# ProfileForm

## Overview
認証済みユーザーのプロフィール更新フォームです。TanStack Query でプロフィール情報を取得し、Server Action を通じて更新します。

## Architecture
- **ProfileForm.tsx**: Container のエントリーポイント（再エクスポート）
- **ProfileFormContainer.tsx**: フックの結果に応じて Presenter / プレースホルダーを切り替え
- **useProfileForm.ts**: TanStack Query ラッパーとフォーム送信ロジック
- **ProfileFormPresenter.tsx**: ピュアな UI レイヤー
- **tests/**: Container / Hook の Vitest テスト
- **stories/**: Presenter の UI 状態と本ドキュメント

## Usage
\`\`\`tsx
import { ProfileForm } from '@/features/settings/components/client/ProfileForm/ProfileForm'

// Server Component から
<ProfileForm />
\`\`\`

## Related Stories
- [Presenter Variations](?path=/story/features-settings-profileform-presenter--default)
        `,
      },
    },
  },
}

export default meta

type Story = StoryObj

export const Documentation: Story = {
  render: () => (
    <div className="bg-card space-y-3 rounded-lg border p-6 text-sm">
      <h3 className="text-lg font-semibold">ProfileForm (Container)</h3>
      <p>
        このストーリーはアーキテクチャと利用方法のドキュメントを目的としており、実際の
        TanStack Query / Server Action 呼び出しはモックしていません。
      </p>
      <p>
        UI バリエーションを確認する場合は Presenter
        ストーリーを参照してください。
      </p>
    </div>
  ),
  parameters: {
    docs: {
      story: {
        inline: true,
      },
    },
  },
}
