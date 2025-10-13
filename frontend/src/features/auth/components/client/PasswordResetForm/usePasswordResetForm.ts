'use client'

import { useState, useTransition } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { requestPasswordResetCommandAction } from '@/external/handler/auth/command.action'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const passwordResetSchema = z.object({
  email: z.email('Please enter a valid email address.'),
})

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>

export type PasswordResetFormPresenterProps = {
  register: UseFormRegister<PasswordResetFormValues>
  errors: FieldErrors<PasswordResetFormValues>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  serverError: string | null
  submittedEmail: string | null
}

export function usePasswordResetForm(): PasswordResetFormPresenterProps {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const submitHandler = handleSubmit((values) => {
    setServerError(null)
    startTransition(() => {
      void (async () => {
        try {
          const response = await requestPasswordResetCommandAction({
            email: values.email,
          })
          if (!response.success) {
            throw new Error(
              response.error ?? 'Failed to send password reset instructions.'
            )
          }
          setSubmittedEmail(values.email)
        } catch (error) {
          setSubmittedEmail(null)
          setServerError(
            error instanceof Error
              ? error.message
              : 'Failed to send password reset instructions.'
          )
        }
      })()
    })
  })

  return {
    register,
    errors,
    onSubmit: submitHandler,
    isSubmitting: isPending,
    serverError,
    submittedEmail,
  }
}
