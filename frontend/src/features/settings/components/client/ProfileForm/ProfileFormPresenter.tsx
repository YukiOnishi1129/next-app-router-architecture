'use client'

import { Button } from '@/shared/components/ui/button'

import type { ProfileFormPresenterProps } from './useProfileForm'

export function ProfileFormPresenter({
  register,
  errors,
  canSubmit,
  onSubmit,
  onReset,
  successMessage,
  updateError,
  isUpdating,
}: ProfileFormPresenterProps) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <input type="hidden" {...register('accountId')} />
      <header className="space-y-1">
        <h2 className="text-base font-medium">Profile settings</h2>
        <p className="text-muted-foreground text-sm">
          Update your name and email address.
        </p>
      </header>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Full name</span>
        <input
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          placeholder="John Doe"
          {...register('name', { required: 'Please enter your name.' })}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <span className="text-destructive text-xs">
            {errors.name.message}
          </span>
        ) : null}
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Email address</span>
        <input
          className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          type="email"
          placeholder="user@example.com"
          {...register('email', {
            required: 'Please enter your email address.',
          })}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <span className="text-destructive text-xs">
            {errors.email.message}
          </span>
        ) : null}
      </label>

      {updateError ? (
        <p className="text-destructive text-sm">
          Failed to update profile: {updateError.message}
        </p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-emerald-600">{successMessage}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!canSubmit}>
          {isUpdating ? 'Updating…' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isUpdating || !canSubmit}
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
