'use client'

import { useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { PasswordInput } from '@/features/account/components/client/PasswordInput'
import { useUpdatePasswordMutation } from '@/features/settings/hooks/useProfileMutations'

import { Button } from '@/shared/components/ui/button'

type ProfilePasswordFormProps = {
  accountId: string
}

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Current password must be at least 8 characters long.'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long.')
      .refine(
        (value) => !value.includes(' '),
        'Password cannot contain whitespace characters.'
      ),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters long.'),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword === data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newPassword'],
        message: 'Your new password must be different from the current one.',
      })
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Confirm password must match the new password.',
      })
    }
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export function ProfilePasswordForm({ accountId }: ProfilePasswordFormProps) {
  const router = useRouter()
  const updatePasswordMutation = useUpdatePasswordMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = form

  const isPending = updatePasswordMutation.isPending || isSubmitting

  const onSubmit = useCallback(
    (values: PasswordFormValues) => {
      void (async () => {
        setServerError(null)
        try {
          const response = await updatePasswordMutation.mutateAsync({
            accountId,
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          })

          if (!response.success) {
            setServerError(
              response.error ?? 'Failed to update password. Please try again.'
            )
            return
          }

          router.replace('/login?passwordUpdated=1')
          router.refresh()
        } catch (error) {
          setServerError(
            error instanceof Error
              ? error.message
              : 'Failed to update password. Please try again.'
          )
        }
      })()
    },
    [accountId, router, updatePasswordMutation]
  )

  return (
    <>
      {isPending ? (
        <div className="bg-background/80 fixed inset-0 z-[999] flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
          <Loader2 className="text-primary h-10 w-10 animate-spin" />
          <p className="text-muted-foreground text-sm">Updating password…</p>
        </div>
      ) : null}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
          <Button type="submit" disabled={!isDirty || isPending}>
            {isPending ? 'Saving…' : 'Update password'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              reset(
                {
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                },
                { keepDirty: false }
              )
              setServerError(null)
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </>
  )
}
