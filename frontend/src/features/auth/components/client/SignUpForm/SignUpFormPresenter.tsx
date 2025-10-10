'use client'

import { PasswordInput } from '@/features/account/components/client/PasswordInput'

import { Button } from '@/shared/components/ui/button'

import type { SignUpFormPresenterProps } from './useSignUpForm'

export function SignUpFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
  serverError,
}: SignUpFormPresenterProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          type="text"
          {...register('name')}
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="email">
          Work email
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
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          Confirm password
        </label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="text-destructive text-xs">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <p className="text-destructive text-sm">{serverError}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
