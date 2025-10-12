'use client'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

import type { ProfileNameFormPresenterProps } from './useProfileNameForm'

export function ProfileNameFormPresenter({
  register,
  errors,
  onSubmit,
  isSubmitting,
  isDirty,
  serverError,
  onReset,
}: ProfileNameFormPresenterProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1 text-left">
        <label className="text-sm font-medium" htmlFor="name">
          Full name
        </label>
        <Input
          id="name"
          {...register('name')}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>

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
  )
}
