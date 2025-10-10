import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta = {
  title: 'Features/Auth/SignOutButton',
  parameters: {
    docs: {
      description: {
        component: `
The container invokes the sign-out mutation hook and passes state into the presenter.
- **SignOutButtonContainer.tsx**: Connects hook results with the presenter
- **useSignOutButton.ts**: Sign-out workflow (TanStack Mutation + router)
- **SignOutButtonPresenter.tsx**: Button UI
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
      <p>See the presenter story for visual states.</p>
    </div>
  ),
}
