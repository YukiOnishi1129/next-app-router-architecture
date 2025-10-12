'use client'

import { useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUpdateProfileMutation } from '@/features/settings/hooks/useUpdateProfileMutation'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

type ProfileEmailFormProps = {
  accountId: string
  currentName: string
  initialEmail: string
}

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
})

type EmailFormValues = z.infer<typeof emailSchema>

export function ProfileEmailForm({
  accountId,
  currentName,
  initialEmail,
}: ProfileEmailFormProps) {
  const router = useRouter()
  const updateProfileMutation = useUpdateProfileMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: initialEmail,
    },
  })

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = form

  const isPending = updateProfileMutation.isPending || isSubmitting

  const onSubmit = useCallback(
    (values: EmailFormValues) => {
      void (async () => {
        setServerError(null)
        try {
          await updateProfileMutation.mutateAsync({
            accountId,
            name: currentName,
            email: values.email,
          })
          reset(values, { keepDirty: false })
          router.replace('/settings/profile?updated=email')
          router.refresh()
        } catch (error) {
          setServerError(
            error instanceof Error
              ? error.message
              : 'Failed to update email address.'
          )
        }
      })()
    },
    [accountId, currentName, reset, router, updateProfileMutation]
  )

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
        Changing your email may require you to verify the new address before
        signing in again.
      </p>

      {serverError ? (
        <p className="text-destructive text-sm">{serverError}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!isDirty || isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!isDirty || isPending}
          onClick={() => {
            reset({ email: initialEmail }, { keepDirty: false })
            setServerError(null)
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
