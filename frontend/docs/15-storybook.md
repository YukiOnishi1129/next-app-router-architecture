# Storybook

## 📚 Overview

このプロジェクトでは Storybook を **ビジュアルドキュメントツール** 兼 **ローカル開発環境** として活用します。

> ⚠️ **注意**: Storybook 上でのテストは CI/CD パイプラインでは実行されません。自動テストは Vitest で実施します。

## 🎯 Storybook の用途

### 1. Visual Documentation
- コンポーネントの使い方をドキュメント化
- UI 状態やバリエーションをカタログ化
- インタラクティブなデモを提供

### 2. Local Development Environment
- コンポーネントを単体で開発・検証
- デザインシステムの動作確認
- UI の手動テスト

## 📁 ファイル構成

Container/Presenter パターンを採用するコンポーネントでは 2 種類の Story を作成します。

```
ThreadTextarea/
├── ThreadTextarea.tsx                    # Re-export (Container)
├── ThreadTextareaContainer.tsx           # 状態オーケストレーション
├── ThreadTextareaPresenter.tsx           # プレゼンテーション
├── useThreadTextarea.ts                  # ビジネスロジックフック
├── ThreadTextarea.stories.tsx            # Container Story（ドキュメント用途）
└── ThreadTextareaPresenter.stories.tsx   # Presenter Story（UI 状態）
```

## 📖 Story の種類

### 1. Container Stories（アーキテクチャドキュメント）

Container Story ではコンポーネント構造や利用方法を Markdown で詳しく説明します。

```tsx
// ThreadTextarea.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ThreadTextarea } from './ThreadTextarea'

const meta = {
  title: 'Features/Thread/ThreadTextarea',
  component: ThreadTextarea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
The ThreadTextarea component is the main input interface for thread conversations.
It follows the Container/Presenter pattern for clean separation of concerns.

## Architecture
- **ThreadTextarea.tsx**: Re-export
d- **ThreadTextareaContainer.tsx**: Orchestrates hooks and state
- **useThreadTextarea.ts**: Business logic
- **ThreadTextareaPresenter.tsx**: Pure UI

## Features
- Message input with validation
- Deep analysis toggle
- Keyboard shortcuts

## Usage
\`\`\`tsx
import { ThreadTextarea } from '@/features/threads/components/client/ThreadTextarea'

<ThreadTextarea onSubmit={(text) => handleSubmit(text)} />
\`\`\`

For UI examples, see the [ThreadTextareaPresenter stories](/?path=/story/features-thread-threadtextarea-presenter--default).
        `,
      },
    },
  },
} satisfies Meta<typeof ThreadTextarea>

export default meta

type Story = StoryObj<typeof meta>

export const Documentation: Story = {
  render: () => (
    <div className="rounded-lg border bg-gray-50 p-6">
      <h3 className="text-lg font-semibold">ThreadTextarea Component</h3>
      <p className="mt-2 text-sm text-gray-600">
        This container orchestrates the thread message input experience.
      </p>
    </div>
  ),
}
```

### 2. Presenter Stories（UI バリエーション）

Presenter Story では UI のすべての状態を並べ、コンポーネントの見た目を確認します。

```tsx
// ThreadTextareaPresenter.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ThreadTextareaPresenter } from './ThreadTextareaPresenter'

const meta = {
  title: 'Features/Thread/ThreadTextarea/Presenter',
  component: ThreadTextareaPresenter,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: { control: 'text' },
    isDeepAnalysis: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof ThreadTextareaPresenter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: '',
    onChange: fn(),
    onSubmit: fn(),
    onToggleDeepAnalysis: fn(),
    isDeepAnalysis: false,
    disabled: false,
  },
}

export const WithContent: Story = {
  args: {
    ...Default.args,
    value: 'Sample message',
  },
}
```

## 🛠️ 実装ガイドライン

### Container Stories
- Markdown を使って構造や責務を説明
- 実際のコード例を記載
- Presenter ストーリーへのリンクを提供

### Presenter Stories
- 代表的な UI 状態をすべて掲載
- Storybook Controls でプロパティを操作できるようにする
- 空文字・エラー・読み込みなど現実的なシナリオを準備

### 命名規則

```
# Container Story タイトル
Features/[Feature]/[ComponentName]

# Presenter Story タイトル
Features/[Feature]/[ComponentName]/Presenter
```

## 🚀 開発フロー

### ローカル開発

```bash
pnpm storybook          # Storybook を起動
pnpm build-storybook    # ドキュメントを静的出力
```

### コンポーネント開発手順
1. Presenter Story で UI を定義
2. Storybook 上で見た目を確認しながら UI を実装
3. Container Story にアーキテクチャを記述
4. Vitest で自動テストを追加

## ⚠️ 注意点

- Storybook 上のテストは CI で実行されません
- ビジュアルリグレッションテストは導入していません
- E2E テストは Storybook 上で行いません

テスト戦略は以下の通りです。
- **Unit**: Vitest（Hook・Utility）
- **Integration**: Vitest（Container Components）
- **Visual**: Storybook（手動確認）

## 📝 ドキュメントの書き方

```tsx
parameters: {
  docs: {
    description: {
      component: `
# Component Name

## Overview
コンポーネントの目的を説明

## Architecture
- ファイル構成
- データフロー
- 状態管理

## Features
- 主な機能
- ユーザー操作
- バリデーション

## Usage
\`\`\`tsx
// 実際の使用例
\`\`\`

## Related Links
- [Presenter Stories](link)
- [関連ドキュメント](link)
      `,
    },
  },
}
```

---

Storybook は以下の目的で利用します。

- コンポーネントカタログの可視化
- インタラクティブなドキュメント
- 独立した開発環境
- デザインシステムの検証

Vitest による自動テストと Storybook によるビジュアル確認を組み合わせ、開発効率と品質を両立させます。
