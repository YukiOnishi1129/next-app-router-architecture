'use client'

import { useCallback, useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRequestEmailChangeMutation } from '@/features/settings/hooks/useProfileMutations'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const emailSchema = z.object({
  email: z.email('Please enter a valid email address.'),
})

type EmailFormValues = z.infer<typeof emailSchema>

type UseProfileEmailFormArgs = {
  accountId: string
  initialEmail: string
}

export type ProfileEmailFormPresenterProps = {
  register: UseFormRegister<EmailFormValues>
  errors: FieldErrors<EmailFormValues>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  isDirty: boolean
  serverError: string | null
  onReset: () => void
  isPendingOverlayVisible: boolean
}

export function useProfileEmailForm({
  accountId,
  initialEmail,
}: UseProfileEmailFormArgs): ProfileEmailFormPresenterProps {
  const router = useRouter()
  const requestEmailChangeMutation = useRequestEmailChangeMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [currentInitialEmail, setCurrentInitialEmail] = useState(initialEmail)
  const [isPendingTransition, startTransition] = useTransition()

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: initialEmail,
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
        email: currentInitialEmail,
      },
      { keepDirty: false }
    )
    setServerError(null)
  }, [currentInitialEmail, reset])

  const handleProfileEmailSubmit = useCallback(
    (values: EmailFormValues) => {
      startTransition(() => {
        void (async () => {
          setServerError(null)
          try {
            await requestEmailChangeMutation.mutateAsync({
              accountId,
              newEmail: values.email,
            })
            setCurrentInitialEmail(values.email)
            reset({ email: values.email }, { keepDirty: false })
            router.replace('/auth/email-change/requested')
          } catch (error) {
            setServerError(
              error instanceof Error
                ? error.message
                : 'Failed to update email address.'
            )
          }
        })()
      })
    },
    [accountId, requestEmailChangeMutation, reset, router]
  )

  const submitHandler = handleSubmit(handleProfileEmailSubmit)

  const isMutationPending = requestEmailChangeMutation.isPending
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
