import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta = {
  title: 'Features/Auth/LoginForm',
  parameters: {
    docs: {
      description: {
        component: `
## Overview
Container for the login form. Mirrors the three-layer structure used in the settings profile form (container/presenter/hook).

## Architecture
- **LoginForm.tsx**: Container entry point
- **LoginFormContainer.tsx**: Thin wrapper wiring hooks to the presenter
- **useLoginForm.ts**: Business logic using React Hook Form
- **LoginFormPresenter.tsx**: UI layer (inputs, validation messages)
- **hooks/useLoginMutation.ts**: Custom hook that calls the sign-in Server Action

## Testing
- LoginForm.test.tsx: Container rendering test
- useLoginForm.test.ts: Hook behaviour test
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
      <h3 className="text-lg font-semibold">LoginForm (Container)</h3>
      <p>See the presenter story for UI patterns.</p>
    </div>
  ),
}
