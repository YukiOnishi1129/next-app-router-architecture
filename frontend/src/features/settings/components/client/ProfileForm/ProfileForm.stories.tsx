import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta = {
  title: 'Features/Settings/ProfileForm',
  parameters: {
    docs: {
      description: {
        component: `
# ProfileForm

## Overview
Profile update form for authenticated users. Fetches profile data via TanStack Query and updates it through a Server Action.

## Architecture
- **ProfileForm.tsx**: Container entry point (re-export)
- **ProfileFormContainer.tsx**: Switches between presenter and placeholders based on hook state
- **useProfileForm.ts**: TanStack Query wrapper + submit workflow
- **ProfileFormPresenter.tsx**: Pure UI layer
- **tests/**: Vitest coverage for container/hook
- **stories/**: Presenter states and this documentation

## Usage
\`\`\`tsx
import { ProfileForm } from '@/features/settings/components/client/ProfileForm/ProfileForm'

// From a server component
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
        This story documents the architecture and usage – TanStack Query /
        Server Action calls are not mocked here.
      </p>
      <p>Refer to the Presenter story for visual variations.</p>
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
