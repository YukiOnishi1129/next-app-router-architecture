'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSignUpMutation } from '@/features/auth/hooks/useSignUpMutation'

import type { Route } from 'next'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

const signUpSchema = z
  .object({
    name: z.string().min(1, '名前を入力してください'),
    email: z.email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(8, 'パスワードは 8 文字以上で入力してください')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        '英字と数字をそれぞれ 1 文字以上含めてください'
      ),
    confirmPassword: z.string().min(8, '確認用パスワードを入力してください'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type SignUpFormValues = z.infer<typeof signUpSchema>

export type SignUpFormPresenterProps = {
  register: UseFormRegister<SignUpFormValues>
  errors: FieldErrors<SignUpFormValues>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  serverError: string | null
}

export function useSignUpForm(): SignUpFormPresenterProps {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const signUpMutation = useSignUpMutation()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const submitHandler = handleSubmit(async ({ name, email, password }) => {
    setServerError(null)
    try {
      const result = await signUpMutation.mutateAsync({
        name,
        email,
        password,
        redirectUrl: '/dashboard',
      })

      const destination = (result.redirectUrl ?? '/dashboard') as Route
      router.replace(destination)
      router.refresh()
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'アカウントの作成に失敗しました'
      )
    }
  })

  return {
    register,
    errors,
    onSubmit: submitHandler,
    isSubmitting: signUpMutation.isPending,
    serverError,
  }
}
