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
    name: z.string().min(1, 'Please enter your name.'),
    email: z.email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        'Password must contain at least one letter and one number.'
      ),
    confirmPassword: z.string().min(8, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
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
          if (!result?.success) {
            throw new Error(result?.error ?? 'Failed to sign up')
          }

          router.replace('/auth/check-email')
        } catch (error) {
          setServerError(
            error instanceof Error ? error.message : 'Failed to sign up'
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
