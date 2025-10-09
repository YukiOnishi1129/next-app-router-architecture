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
          'ProfileFormPresenter は純粋な UI コンポーネントで、フォームの描画とエラーメッセージ表示のみを担当します。' +
          '\nContainer/Hook 層から渡された props をそのまま描画するため、Story では props を差し替えることで UI 状態を確認できます。',
      },
    },
  },
}

export default meta

const Template: StoryFn<typeof ProfileFormPresenter> = (overrides) => {
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      userId: 'user_1',
      name: '山田 太郎',
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
  successMessage: 'プロフィールを更新しました',
}

export const ErrorState = Template.bind({})
ErrorState.storyName = 'Update error'
ErrorState.args = {
  canSubmit: false,
  updateError: new Error('更新に失敗しました'),
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
      userId: 'user_1',
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    form.setError('name', {
      type: 'required',
      message: '氏名を入力してください',
    })
    form.setError('email', {
      type: 'required',
      message: 'メールアドレスを入力してください',
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
