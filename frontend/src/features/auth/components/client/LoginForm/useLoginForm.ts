'use client'

import { useState, useTransition, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSignIn } from '@/features/auth/hooks/useSignIn'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const loginSchema = z.object({
  email: z.email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは 8 文字以上で入力してください'),
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
            throw new Error(result?.error ?? 'サインインに失敗しました')
          }

          router.refresh()
          router.replace('/dashboard')
        } catch (error) {
          setServerError(
            error instanceof Error ? error.message : 'サインインに失敗しました'
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
