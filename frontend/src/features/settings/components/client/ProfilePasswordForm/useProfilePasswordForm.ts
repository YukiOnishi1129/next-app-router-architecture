'use client'

import { useCallback, useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUpdatePasswordMutation } from '@/features/settings/hooks/useProfileMutations'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Current password must be at least 8 characters long.'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long.')
      .refine(
        (value) => !value.includes(' '),
        'Password cannot contain whitespace characters.'
      ),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters long.'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword === data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newPassword'],
        message: 'Your new password must be different from the current one.',
      })
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Confirm password must match the new password.',
      })
    }
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

type UseProfilePasswordFormArgs = {
  accountId: string
}

export type ProfilePasswordFormPresenterProps = {
  register: UseFormRegister<PasswordFormValues>
  errors: FieldErrors<PasswordFormValues>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  isDirty: boolean
  serverError: string | null
  onReset: () => void
  isPendingOverlayVisible: boolean
}

export function useProfilePasswordForm({
  accountId,
}: UseProfilePasswordFormArgs): ProfilePasswordFormPresenterProps {
  const router = useRouter()
  const updatePasswordMutation = useUpdatePasswordMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPendingTransition, startTransition] = useTransition()

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = form

  const handleReset = () => {
    reset(
      {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      { keepDirty: false }
    )
    setServerError(null)
  }

  const handleProfilePasswordSubmit = useCallback(
    (values: PasswordFormValues) => {
      startTransition(() => {
        void (async () => {
          setServerError(null)
          try {
            const response = await updatePasswordMutation.mutateAsync({
              accountId,
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            })

            if (!response.success) {
              setServerError(
                response.error ?? 'Failed to update password. Please try again.'
              )
              return
            }

            router.replace('/login?passwordUpdated=1')
            router.refresh()
          } catch (error) {
            setServerError(
              error instanceof Error
                ? error.message
                : 'Failed to update password. Please try again.'
            )
          }
        })()
      })
    },
    [accountId, router, updatePasswordMutation]
  )

  const submitHandler = handleSubmit(handleProfilePasswordSubmit)

  const isMutationPending = updatePasswordMutation.isPending
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
    isPendingOverlayVisible: isMutationPending || isPendingTransition,
  }
}
