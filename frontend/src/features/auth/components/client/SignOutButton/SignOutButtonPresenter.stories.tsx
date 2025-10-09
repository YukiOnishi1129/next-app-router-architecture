import { SignOutButtonPresenter } from './SignOutButtonPresenter'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof SignOutButtonPresenter> = {
  title: 'Features/Auth/SignOutButton/Presenter',
  component: SignOutButtonPresenter,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof SignOutButtonPresenter>

export const Default: Story = {
  args: {
    isSigningOut: false,
    onSignOut: () => undefined,
  },
}

export const Loading: Story = {
  args: {
    isSigningOut: true,
    onSignOut: () => undefined,
  },
}
