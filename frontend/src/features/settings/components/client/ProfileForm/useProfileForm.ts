'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { useProfileSettingsQuery } from '@/features/settings/hooks/useProfileSettingsQuery'
import { useUpdateProfileMutation } from '@/features/settings/hooks/useUpdateProfileMutation'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export type ProfileFormValues = {
  userId: string
  name: string
  email: string
}

export type ProfileFormPresenterProps = {
  register: UseFormRegister<ProfileFormValues>
  errors: FieldErrors<ProfileFormValues>
  canSubmit: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onReset: () => void
  successMessage: string | null
  updateError: Error | null
  isUpdating: boolean
}

export type ProfileFormLoadingState = {
  status: 'loading'
}

export type ProfileFormErrorState = {
  status: 'error'
  message: string
  retry: () => void
}

type ProfileFormReadyState = {
  status: 'ready'
  props: ProfileFormPresenterProps
}

export type UseProfileFormResult =
  | ProfileFormLoadingState
  | ProfileFormErrorState
  | ProfileFormReadyState

export const useProfileForm = (): UseProfileFormResult => {
  const profileQuery = useProfileSettingsQuery()
  const updateProfileMutation = useUpdateProfileMutation()

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      userId: '',
      name: '',
      email: '',
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        userId: profileQuery.data.id,
        name: profileQuery.data.name,
        email: profileQuery.data.email,
      })
    }
  }, [profileQuery.data, reset])

  useEffect(() => {
    if (updateProfileMutation.error) {
      setSuccessMessage(null)
    }
  }, [updateProfileMutation.error])

  const handleSubmitForm = handleSubmit(async (values) => {
    setSuccessMessage(null)
    try {
      const updatedUser = await updateProfileMutation.mutateAsync(values)
      if (!updatedUser.success || !updatedUser.user) {
        return
      }
      setSuccessMessage('プロフィールを更新しました')
      reset(
        {
          userId: updatedUser.user.id,
          name: updatedUser.user.name,
          email: updatedUser.user.email,
        },
        { keepDirty: false }
      )
      updateProfileMutation.reset()
    } catch {
      // エラー表示は updateError に委ねる
    }
  })

  const canSubmit = useMemo(
    () =>
      !profileQuery.isLoading &&
      !profileQuery.error &&
      isDirty &&
      !updateProfileMutation.isPending,
    [
      profileQuery.isLoading,
      profileQuery.error,
      isDirty,
      updateProfileMutation.isPending,
    ]
  )

  const handleReset = useCallback(() => {
    if (!profileQuery.data) return
    reset(
      {
        userId: profileQuery.data.id,
        name: profileQuery.data.name,
        email: profileQuery.data.email,
      },
      { keepDirty: false }
    )
    setSuccessMessage(null)
    updateProfileMutation.reset()
  }, [profileQuery.data, reset, updateProfileMutation])

  useEffect(() => {
    if (profileQuery.error) {
      console.error('プロフィールの取得に失敗しました', profileQuery.error)
    }
  }, [profileQuery.error])

  useEffect(() => {
    if (profileQuery.isLoading || profileQuery.data) {
      return
    }
    profileQuery.refetch()
  }, [profileQuery])

  if (profileQuery.isLoading) {
    return { status: 'loading' }
  }

  if (!profileQuery.data || profileQuery.error) {
    return {
      status: 'error',
      message:
        profileQuery.error?.message ?? 'プロフィール情報が見つかりません。',
      retry: profileQuery.refetch,
    }
  }

  return {
    status: 'ready',
    props: {
      register,
      errors,
      canSubmit,
      onSubmit: handleSubmitForm,
      onReset: handleReset,
      successMessage,
      updateError: updateProfileMutation.error as Error | null,
      isUpdating: updateProfileMutation.isPending,
    },
  }
}
