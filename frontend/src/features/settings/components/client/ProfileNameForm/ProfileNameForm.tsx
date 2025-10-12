'use client'

import { useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUpdateProfileNameMutation } from '@/features/settings/hooks/useProfileMutations'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

type ProfileNameFormProps = {
  accountId: string
  initialName: string
}

const nameSchema = z.object({
  name: z.string().min(1, 'Please enter your name.').max(100),
})

type NameFormValues = z.infer<typeof nameSchema>

export function ProfileNameForm({
  accountId,
  initialName,
}: ProfileNameFormProps) {
  const router = useRouter()
  const updateProfileMutation = useUpdateProfileNameMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: initialName,
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
    (values: NameFormValues) => {
      void (async () => {
        setServerError(null)
        try {
          await updateProfileMutation.mutateAsync({
            accountId,
            name: values.name,
          })
          reset(values, { keepDirty: false })
          router.replace('/settings/profile?updated=name')
          router.refresh()
        } catch (error) {
          setServerError(
            error instanceof Error ? error.message : 'Failed to update name.'
          )
        }
      })()
    },
    [accountId, reset, router, updateProfileMutation]
  )

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
        <Button type="submit" disabled={!isDirty || isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!isDirty || isPending}
          onClick={() => {
            reset({ name: initialName }, { keepDirty: false })
            setServerError(null)
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
