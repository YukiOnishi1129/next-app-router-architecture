import type { Meta, StoryFn } from '@storybook/react'
import { useForm } from 'react-hook-form'

import { LoginFormPresenter } from './LoginFormPresenter'
import type { LoginFormPresenterProps, LoginFormValues } from './useLoginForm'

const meta: Meta<typeof LoginFormPresenter> = {
  title: 'Features/Auth/LoginForm/Presenter',
  component: LoginFormPresenter,
  parameters: {
    layout: 'centered',
  },
}

export default meta

const Template: StoryFn<typeof LoginFormPresenter> = (overrides) => {
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: 'user@example.com',
      password: 'password123',
    },
  })

  const props: LoginFormPresenterProps = {
    register: form.register,
    errors: form.formState.errors,
    onSubmit: (event) => {
      event.preventDefault()
    },
    isSubmitting: false,
    serverError: null,
  }

  return <LoginFormPresenter {...props} {...overrides} />
}

export const Default = Template.bind({})

export const WithError = Template.bind({})
WithError.args = {
  serverError: 'Invalid email or password',
}

export const Submitting = Template.bind({})
Submitting.args = {
  isSubmitting: true,
}
