'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useForm } from 'react-hook-form'

import { useProfileSettings } from '@/features/settings/hooks/useProfileSettings'

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
  const {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile,
    isUpdating,
    updateError,
    resetUpdateState,
  } = useProfileSettings()

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
    if (profile) {
      reset({
        userId: profile.id,
        name: profile.name,
        email: profile.email,
      })
    }
  }, [profile, reset])

  useEffect(() => {
    if (updateError) {
      setSuccessMessage(null)
    }
  }, [updateError])

  const handleSubmitForm = handleSubmit(async (values) => {
    setSuccessMessage(null)
    try {
      const updated = await updateProfile(values)
      setSuccessMessage('プロフィールを更新しました')
      reset(
        {
          userId: updated.id,
          name: updated.name,
          email: updated.email,
        },
        { keepDirty: false }
      )
      resetUpdateState()
    } catch {
      // エラー表示は updateError に委ねる
    }
  })

  const canSubmit = useMemo(
    () => !isLoading && !error && isDirty && !isUpdating,
    [isLoading, error, isDirty, isUpdating]
  )

  const handleReset = useCallback(() => {
    if (!profile) return
    reset(
      {
        userId: profile.id,
        name: profile.name,
        email: profile.email,
      },
      { keepDirty: false }
    )
    setSuccessMessage(null)
    resetUpdateState()
  }, [profile, reset, resetUpdateState])

  useEffect(() => {
    if (error) {
      console.error('プロフィールの取得に失敗しました', error)
    }
  }, [error])

  useEffect(() => {
    if (isLoading || profile) {
      return
    }
    refetch()
  }, [isLoading, profile, refetch])

  if (isLoading) {
    return { status: 'loading' }
  }

  if (!profile || error) {
    return {
      status: 'error',
      message: error?.message ?? 'プロフィール情報が見つかりません。',
      retry: refetch,
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
      updateError,
      isUpdating,
    },
  }
}
