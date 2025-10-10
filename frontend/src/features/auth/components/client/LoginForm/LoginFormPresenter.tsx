'use client'

import { PasswordInput } from '@/features/account/components'

import { Button } from '@/shared/components/ui/button'

import type { LoginFormPresenterProps } from './useLoginForm'

export function LoginFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
  serverError,
}: LoginFormPresenterProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          autoFocus
        />
        {errors.email ? (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
          hideToggle
        />
        {errors.password ? (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        ) : null}
      </div>

      {serverError ? (
        <p className="text-destructive text-sm">{serverError}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
