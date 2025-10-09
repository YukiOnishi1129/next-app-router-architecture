import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Features/Auth/SignUpForm',
  parameters: {
    docs: {
      description: {
        component: `
Container コンポーネントはフックと Presenter を結線する薄いラッパーです。UI 状態は Presenter ストーリーで確認してください。
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
      <p>Presenter ストーリーで UI バリエーションを確認してください。</p>
    </div>
  ),
}
