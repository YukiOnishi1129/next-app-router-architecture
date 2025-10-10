import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { ProfileFormPresenter } from './ProfileFormPresenter'

import type {
  ProfileFormPresenterProps,
  ProfileFormValues,
} from './useProfileForm'
import type { Meta, StoryFn } from '@storybook/nextjs'

const meta: Meta<typeof ProfileFormPresenter> = {
  title: 'Features/Settings/ProfileForm/Presenter',
  component: ProfileFormPresenter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ProfileFormPresenter is a pure UI component responsible for rendering the form and error messages.\nUse stories to inject props from containers/hooks and preview visual states.',
      },
    },
  },
}

export default meta

const Template: StoryFn<typeof ProfileFormPresenter> = (overrides) => {
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      accountId: 'user_1',
      name: 'John Doe',
      email: 'user@example.com',
    },
  })

  const props: ProfileFormPresenterProps = {
    register: form.register,
    errors: form.formState.errors,
    canSubmit: true,
    onSubmit: form.handleSubmit(() => undefined),
    onReset: () => form.reset(),
    successMessage: null,
    updateError: null,
    isUpdating: false,
  }

  return <ProfileFormPresenter {...props} {...overrides} />
}

export const Default = Template.bind({})
Default.storyName = 'Default state'

export const Success = Template.bind({})
Success.storyName = 'Success message'
Success.args = {
  successMessage: 'Profile updated successfully.',
}

export const ErrorState = Template.bind({})
ErrorState.storyName = 'Update error'
ErrorState.args = {
  canSubmit: false,
  updateError: new Error('Failed to update profile'),
}

export const Updating = Template.bind({})
Updating.storyName = 'Submitting…'
Updating.args = {
  canSubmit: false,
  isUpdating: true,
}

export const ValidationErrors: StoryFn<typeof ProfileFormPresenter> = () => {
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      accountId: 'user_1',
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    form.setError('name', {
      type: 'required',
      message: 'Please enter your name.',
    })
    form.setError('email', {
      type: 'required',
      message: 'Please enter your email address.',
    })
  }, [form])

  const props: ProfileFormPresenterProps = {
    register: form.register,
    errors: form.formState.errors,
    canSubmit: false,
    onSubmit: form.handleSubmit(() => undefined),
    onReset: () => form.reset(),
    successMessage: null,
    updateError: null,
    isUpdating: false,
  }

  return <ProfileFormPresenter {...props} />
}
