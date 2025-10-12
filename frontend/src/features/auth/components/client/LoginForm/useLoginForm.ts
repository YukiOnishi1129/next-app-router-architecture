'use client'

import { useState, useTransition, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSignIn } from '@/features/auth/hooks/useSignIn'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const loginSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export type LoginFormPresenterProps = {
  register: UseFormRegister<LoginFormValues>
  errors: FieldErrors<LoginFormValues>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  serverError: string | null
}

export function useLoginForm(): LoginFormPresenterProps {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { handleSignIn } = useSignIn()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const handleLoginSubmit = useCallback(
    (data: LoginFormValues) => {
      startTransition(async () => {
        setServerError(null)
        try {
          const result = await handleSignIn(data.email, data.password)
          if (!result || result.error) {
            throw new Error(result?.error ?? 'Failed to sign in')
          }

          router.refresh()
          router.replace('/dashboard')
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === 'EMAIL_NOT_VERIFIED'
          ) {
            router.replace('/auth/check-email')
            setServerError(
              'Please verify your email before signing in. We have sent a new verification link.'
            )
            return
          }

          setServerError(
            error instanceof Error ? error.message : 'Failed to sign in'
          )
        }
      })
    },
    [handleSignIn, router]
  )

  const submitHandler = handleSubmit(handleLoginSubmit)

  return {
    register,
    errors,
    onSubmit: submitHandler,
    isSubmitting: isPending,
    serverError,
  }
}
