'use client'

import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

import type { PasswordResetFormPresenterProps } from './usePasswordResetForm'

export function PasswordResetFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
  serverError,
  submittedEmail,
}: PasswordResetFormPresenterProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {submittedEmail ? (
        <div className="rounded-md border border-emerald-300/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          We sent password reset instructions to {submittedEmail}. If you
          don&apos;t see the email, check your spam folder or try again in a few
          minutes.
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
          disabled={isSubmitting}
        />
        {errors.email ? (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        ) : null}
      </div>

      {serverError ? (
        <p className="text-destructive text-sm">{serverError}</p>
      ) : null}

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
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
