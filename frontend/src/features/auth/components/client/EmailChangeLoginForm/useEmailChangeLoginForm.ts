'use client'

import { useCallback, useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { CREDENTIAL_TYPE } from '@/features/auth/constants/credential'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const emailChangeLoginSchema = z.object({
  previousEmail: z
    .string()
    .email('Please enter the email address you used before the change.'),
  email: z
    .string()
    .email('Please enter the new verified email address for your account.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
})

export type EmailChangeLoginFormValues = z.infer<typeof emailChangeLoginSchema>

export type EmailChangeLoginFormPresenterProps = {
  register: UseFormRegister<EmailChangeLoginFormValues>
  errors: FieldErrors<EmailChangeLoginFormValues>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  serverError: string | null
}

export const useEmailChangeLoginForm = (
  defaultPreviousEmail?: string
): EmailChangeLoginFormPresenterProps => {
    const router = useRouter()
    const [serverError, setServerError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const form = useForm<EmailChangeLoginFormValues>({
      resolver: zodResolver(emailChangeLoginSchema),
      defaultValues: {
        previousEmail: defaultPreviousEmail ?? '',
        email: '',
        password: '',
      },
    })

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = form

    const handleEmailChangeLoginSubmit = useCallback(
      (data: EmailChangeLoginFormValues) => {
        startTransition(async () => {
          setServerError(null)
          try {
            const result = await signIn('credentials', {
              redirect: false,
              email: data.email,
              previousEmail: data.previousEmail,
              password: data.password,
              action: CREDENTIAL_TYPE.EMAIL_CHANGE_LOGIN,
            })

            if (!result || result.error) {
              throw new Error(
                result?.error ?? 'Failed to sign in with new email'
              )
            }

            router.refresh()
            router.replace('/auth/email-change/complete')
          } catch (error) {
            if (
              error instanceof Error &&
              error.message === 'EMAIL_NOT_VERIFIED'
            ) {
              router.replace('/auth/check-email')
              setServerError(
                'Please verify your new email address before signing in. The verification link was re-sent.'
              )
              return
            }

            setServerError(
              error instanceof Error ? error.message : 'Failed to sign in'
            )
          }
        })
      },
      [router]
    )

    const submitHandler = handleSubmit(handleEmailChangeLoginSubmit)

    return {
      register,
      errors,
      onSubmit: submitHandler,
      isSubmitting: isPending,
      serverError,
    }
  }
