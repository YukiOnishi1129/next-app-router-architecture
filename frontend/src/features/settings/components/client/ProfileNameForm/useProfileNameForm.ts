'use client'

import { useCallback, useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import { useUpdateProfileNameMutation } from '@/features/settings/hooks/useProfileMutations'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const nameSchema = z.object({
  name: z.string().min(1, 'Please enter your name.').max(100),
})

type NameFormValues = z.infer<typeof nameSchema>

type UseProfileNameFormArgs = {
  accountId: string
  initialName: string
}

export type ProfileNameFormPresenterProps = {
  register: UseFormRegister<NameFormValues>
  errors: FieldErrors<NameFormValues>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  isDirty: boolean
  serverError: string | null
  onReset: () => void
}

export function useProfileNameForm({
  accountId,
  initialName,
}: UseProfileNameFormArgs): ProfileNameFormPresenterProps {
  const router = useRouter()
  const updateProfileMutation = useUpdateProfileNameMutation()
  const { update: updateSession } = useAuthSession()
  const [serverError, setServerError] = useState<string | null>(null)
  const [currentInitialName, setCurrentInitialName] = useState(initialName)
  const [isPendingTransition, startTransition] = useTransition()

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: initialName,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = form

  const handleReset = useCallback(() => {
    reset(
      {
        name: currentInitialName,
      },
      { keepDirty: false }
    )
    setServerError(null)
  }, [currentInitialName, reset])

  const handleProfileNameSubmit = useCallback(
    (values: NameFormValues) => {
      startTransition(() => {
        void (async () => {
          setServerError(null)
          try {
            const response = await updateProfileMutation.mutateAsync({
              accountId,
              name: values.name,
            })
            if (response.success && response.account) {
              await updateSession({
                account: response.account,
              })
            }
            setCurrentInitialName(values.name)
            reset(values, { keepDirty: false })
            router.replace('/settings/profile?updated=name')
            router.refresh()
          } catch (error) {
            setServerError(
              error instanceof Error ? error.message : 'Failed to update name.'
            )
          }
        })()
      })
    },
    [accountId, reset, router, updateProfileMutation, updateSession]
  )

  const submitHandler = handleSubmit(handleProfileNameSubmit)

  const isMutationPending = updateProfileMutation.isPending
  const isSubmittingState =
    isSubmitting || isMutationPending || isPendingTransition

  return {
    register,
    errors,
    onSubmit: submitHandler,
    isSubmitting: isSubmittingState,
    isDirty,
    serverError,
    onReset: handleReset,
  }
}
