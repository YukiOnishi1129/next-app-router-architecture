'use client'

import { Loader2 } from 'lucide-react'

import { PasswordInput } from '@/features/account/components/client/PasswordInput'

import { Button } from '@/shared/components/ui/button'

import type { ProfilePasswordFormPresenterProps } from './useProfilePasswordForm'

export function ProfilePasswordFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
  isDirty,
  serverError,
  onReset,
  isPendingOverlayVisible,
}: ProfilePasswordFormPresenterProps) {
  return (
    <>
      {isPendingOverlayVisible ? (
        <div className="bg-background/80 fixed inset-0 z-[999] flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
          <p className="text-muted-foreground text-sm">Updating password…</p>
        </div>
      ) : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1 text-left">
          <label className="text-sm font-medium" htmlFor="currentPassword">
            Current password
          </label>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            {...register('currentPassword')}
            aria-invalid={Boolean(errors.currentPassword)}
          />
          {errors.currentPassword ? (
            <p className="text-destructive text-xs">
              {errors.currentPassword.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1 text-left">
          <label className="text-sm font-medium" htmlFor="newPassword">
            New password
          </label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...register('newPassword')}
            aria-invalid={Boolean(errors.newPassword)}
          />
          {errors.newPassword ? (
            <p className="text-destructive text-xs">
              {errors.newPassword.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1 text-left">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register('confirmPassword')}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword ? (
            <p className="text-destructive text-xs">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <p className="text-muted-foreground text-xs">
          After updating your password, we will sign you out for security. Sign
          back in with your new password to continue.
        </p>

        {serverError ? (
          <p className="text-destructive text-sm">{serverError}</p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Update password'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onReset}
          >
            Clear
          </Button>
        </div>
      </form>
    </>
  )
}
