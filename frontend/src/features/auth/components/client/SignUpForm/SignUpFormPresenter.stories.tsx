import type { Meta, StoryFn } from '@storybook/react'
import { useForm } from 'react-hook-form'

import { SignUpFormPresenter } from './SignUpFormPresenter'
import type { SignUpFormPresenterProps, SignUpFormValues } from './useSignUpForm'

const meta: Meta<typeof SignUpFormPresenter> = {
  title: 'Features/Auth/SignUpForm/Presenter',
  component: SignUpFormPresenter,
  parameters: {
    layout: 'centered',
  },
}

export default meta

const Template: StoryFn<typeof SignUpFormPresenter> = (overrides) => {
  const form = useForm<SignUpFormValues>({
    defaultValues: {
      name: '山田 太郎',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    },
  })

  const props: SignUpFormPresenterProps = {
    register: form.register,
    errors: form.formState.errors,
    onSubmit: (event) => event.preventDefault(),
    isSubmitting: false,
    serverError: null,
  }

  return <SignUpFormPresenter {...props} {...overrides} />
}

export const Default = Template.bind({})

export const WithServerError = Template.bind({})
WithServerError.args = {
  serverError: 'このメールアドレスは既に登録されています',
}

export const Submitting = Template.bind({})
Submitting.args = {
  isSubmitting: true,
}
