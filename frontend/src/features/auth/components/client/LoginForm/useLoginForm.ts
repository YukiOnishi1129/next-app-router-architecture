'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
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
  const loginMutation = useLoginMutation()
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

  const submitHandler = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const result = await loginMutation.mutateAsync({
        ...values,
        redirectUrl: '/dashboard',
      })

      router.replace(result.redirectUrl ?? '/dashboard')
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'サインインに失敗しました'
      )
    }
  })

  return {
    register,
    errors,
    onSubmit: submitHandler,
    isSubmitting: loginMutation.isPending,
    serverError,
  }
}
