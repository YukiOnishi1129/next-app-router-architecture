'use client'

import { useState, useTransition } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { requestPasswordResetAction } from '@/features/auth/actions/password-reset.action'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

const passwordResetSchema = z.object({
  email: z.email('Please enter a valid email address.'),
})

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>

export function PasswordResetForm() {
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

  const onSubmit = handleSubmit((values) => {
    setServerError(null)
    startTransition(() => {
      void (async () => {
        try {
          const response = await requestPasswordResetAction({
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

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {submittedEmail ? (
        <div className="rounded-md border border-emerald-300/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          We sent password reset instructions to {submittedEmail}. If you don&apos;t
          see the email, check your spam folder or try again in a few minutes.
        </div>
      ) : null}

      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="email">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
          disabled={isPending}
        />
        {errors.email ? (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        ) : null}
      </div>

      {serverError ? (
        <p className="text-destructive text-sm">{serverError}</p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </span>
        ) : (
          'Send reset instructions'
        )}
      </Button>
    </form>
  )
}
