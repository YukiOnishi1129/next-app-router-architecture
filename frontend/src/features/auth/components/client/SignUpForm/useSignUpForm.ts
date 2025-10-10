'use client'

import { useState, useTransition, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSignUp } from '@/features/auth/hooks/useSignUp'

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
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const { handleSignUp } = useSignUp()

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

  const handleSignupSubmit = useCallback(
    (data: SignUpFormValues) => {
      startTransition(async () => {
        setServerError(null)
        try {
          const result = await handleSignUp({
            name: data.name,
            email: data.email,
            password: data.password,
          })
          if (!result || result.error) {
            throw new Error(result?.error ?? 'サインアップに失敗しました')
          }

          router.refresh()
          router.replace('/dashboard')
        } catch (error) {
          setServerError(
            error instanceof Error
              ? error.message
              : 'サインアップに失敗しました'
          )
        }
      })
    },
    [handleSignUp, router]
  )

  const submitHandler = handleSubmit(handleSignupSubmit)

  return {
    register,
    errors,
    onSubmit: submitHandler,
    isSubmitting: isPending,
    serverError,
  }
}
