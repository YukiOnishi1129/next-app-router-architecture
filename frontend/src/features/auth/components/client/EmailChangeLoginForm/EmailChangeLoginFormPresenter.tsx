'use client'

import { PasswordInput } from '@/features/account/components/client/PasswordInput'

import { Button } from '@/shared/components/ui/button'

import type { EmailChangeLoginFormPresenterProps } from './useEmailChangeLoginForm'

export const EmailChangeLoginFormPresenter = ({
  register,
  errors,
  onSubmit,
  isSubmitting,
  serverError,
}: EmailChangeLoginFormPresenterProps) => {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="previousEmail">
          Previous email
        </label>
        <input
          id="previousEmail"
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="email"
          {...register('previousEmail')}
          aria-invalid={Boolean(errors.previousEmail)}
          autoComplete="email"
        />
        {errors.previousEmail ? (
          <p className="text-destructive text-xs">
            {errors.previousEmail.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="email">
          New email
        </label>
        <input
          id="email"
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
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
        {isSubmitting ? 'Signing in…' : 'Sign in with new email'}
      </Button>
    </form>
  )
}
