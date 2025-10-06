# テスト戦略

## 概要

このプロジェクトではVitest + Testing Libraryを使用して、保守性の高いテストを実現します。

## テスト環境

### Vitest
- **高速**: ESBuildベースで高速なテスト実行
- **設定が簡単**: Viteと同じ設定を共有
- **ウォッチモード**: ファイル変更を検知して自動実行
- **カバレッジ**: c8による詳細なカバレッジレポート

### Testing Library
- **ユーザー中心**: ユーザーの操作をシミュレート
- **アクセシビリティ**: ロールベースのクエリを推奨
- **保守性**: 実装詳細に依存しないテスト

## テストの種類

### 1. コンポーネントテスト
UIコンポーネントの振る舞いをテスト。

```typescript
// src/shared/components/ui/Button.test.tsx
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('クリックイベントが発火する', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### 2. Server Componentテスト
非同期のServer Componentをテスト。

```typescript
// src/app/users/UserList.test.tsx
import { render, screen } from '@/test/test-utils'
import { renderServerComponent } from '@/test/server-component-utils'
import { UserList } from './UserList'

describe('UserList', () => {
  it('ユーザー一覧を表示する', async () => {
    const { container } = await renderServerComponent(<UserList />)
    
    expect(await screen.findByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})
```

### 3. フォームテスト
React Hook Form + Zodを使用したフォームのテスト。

```typescript
// src/features/users/components/UserForm.test.tsx
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { UserForm } from './UserForm'

describe('UserForm', () => {
  it('バリデーションエラーを表示する', async () => {
    const user = userEvent.setup()
    render(<UserForm />)
    
    // 空のまま送信
    await user.click(screen.getByRole('button', { name: '送信' }))
    
    await waitFor(() => {
      expect(screen.getByText('名前は必須です')).toBeInTheDocument()
    })
  })
})
```

### 4. 統合テスト
複数のコンポーネントや機能を組み合わせたテスト。

```typescript
// src/features/auth/auth.integration.test.tsx
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '@/app/login/page'

describe('認証フロー', () => {
  it('ログイン後ダッシュボードへ遷移する', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await user.type(screen.getByLabelText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
```

## テストのベストプラクティス

### 1. AAA (Arrange, Act, Assert) パターン
```typescript
it('タスクを完了できる', async () => {
  // Arrange
  const task = { id: 1, title: 'テストタスク', completed: false }
  render(<TaskItem task={task} />)
  
  // Act
  await user.click(screen.getByRole('checkbox'))
  
  // Assert
  expect(screen.getByRole('checkbox')).toBeChecked()
})
```

### 2. データ属性よりロールを使用
```typescript
// 推奨
screen.getByRole('button', { name: '送信' })
screen.getByLabelText('メールアドレス')

// 非推奨
screen.getByTestId('submit-button')
screen.getByClassName('email-input')
```

### 3. モックの適切な使用
```typescript
// src/test/setup.ts でグローバルモックを設定
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
}))

// テスト内でモックをリセット
beforeEach(() => {
  vi.clearAllMocks()
})
```

### 4. 非同期処理の適切なハンドリング
```typescript
// waitForを使用
await waitFor(() => {
  expect(screen.getByText('データを読み込みました')).toBeInTheDocument()
})

// findByを使用
const element = await screen.findByText('データを読み込みました')
```

## テストコマンド

```bash
# テスト実行（ウォッチモード）
npm run test

# UIモードでテスト実行
npm run test:ui

# 全テスト実行（CI用）
npm run test:run

# カバレッジレポート生成
npm run test:coverage
```

## カバレッジ目標

- 全体: 80%以上
- コンポーネント: 90%以上
- ユーティリティ: 100%
- Server Actions: 80%以上

## CI/CD統合

GitHub Actionsでの自動テスト実行:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```