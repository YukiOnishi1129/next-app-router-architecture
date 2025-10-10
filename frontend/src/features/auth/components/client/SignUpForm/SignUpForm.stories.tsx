import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta = {
  title: 'Features/Auth/SignUpForm',
  parameters: {
    docs: {
      description: {
        component: `
The container wires hooks and the presenter together. Refer to the presenter story to preview UI states.
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
      <p>Check the presenter story to explore visual variations.</p>
    </div>
  ),
}
