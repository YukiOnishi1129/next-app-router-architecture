'use client'

import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

import type { ProfileEmailFormPresenterProps } from './useProfileEmailForm'

export function ProfileEmailFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
  isDirty,
  serverError,
  onReset,
  isPendingOverlayVisible,
}: ProfileEmailFormPresenterProps) {
  return (
    <>
      {isPendingOverlayVisible ? (
        <div className="bg-background/80 fixed inset-0 z-[999] flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Sending confirmation email…
          </p>
        </div>
      ) : null}
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1 text-left">
          <label className="text-sm font-medium" htmlFor="email">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          ) : null}
        </div>

        <p className="text-muted-foreground text-xs">
          Changing your email sends a verification link to the new address.
          Follow the instructions to confirm the change and sign in again.
        </p>

        {serverError ? (
          <p className="text-destructive text-sm">{serverError}</p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || isSubmitting}
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </form>
    </>
  )
}
