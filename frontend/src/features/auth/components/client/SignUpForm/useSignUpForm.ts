'use client'

import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  useForm,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form'

import { useRegisterMutation } from '@/features/auth/hooks/useRegisterMutation'

const signupSchema = z
  .object({
    name: z.string().min(1, '氏名を入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z
      .string()
      .min(8, 'パスワードは 8 文字以上で入力してください'),
    confirmPassword: z.string().min(1, '確認用パスワードを入力してください'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: '同じパスワードを入力してください',
    path: ['confirmPassword'],
  })

export type SignUpFormValues = z.infer<typeof signupSchema>

export type SignUpFormPresenterProps = {
  register: UseFormRegister<SignUpFormValues>
  errors: FieldErrors<SignUpFormValues>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  serverError: string | null
}

export function useSignUpForm(): SignUpFormPresenterProps {
  const router = useRouter()
  const registerMutation = useRegisterMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
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

  const submitHandler = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const result = await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        redirectUrl: '/dashboard',
      })

      router.replace(result.redirectUrl ?? '/dashboard')
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'アカウント作成に失敗しました'
      )
    }
  })

  return {
    register,
    errors,
    onSubmit: (event) => {
      event.preventDefault()
      void submitHandler(event)
    },
    isSubmitting: registerMutation.isPending,
    serverError,
  }
}
