'use client'

import { Button } from '@/shared/components/ui/button'

import type { CreateRequestFormValues } from '@/features/requests/schemas'
import type { FormEvent } from 'react'
import type { UseFormReturn } from 'react-hook-form'

type Option = {
  value: string
  label: string
}

type RequestFormPresenterProps = {
  form: UseFormReturn<CreateRequestFormValues>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  typeOptions: Option[]
  priorityOptions: Option[]
  serverError?: string | null
  isSubmitting?: boolean
}

export function RequestFormPresenter({
  form,
  onSubmit,
  typeOptions,
  priorityOptions,
  serverError,
  isSubmitting = false,
}: RequestFormPresenterProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm font-medium">
        Title
        <input
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          {...register('title')}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title ? (
          <p className="text-destructive mt-1 text-xs">
            {errors.title.message}
          </p>
        ) : null}
      </label>

      <label className="block text-sm font-medium">
        Description
        <textarea
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          rows={4}
          {...register('description')}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description ? (
          <p className="text-destructive mt-1 text-xs">
            {errors.description.message}
          </p>
        ) : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Type
          <select
            className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            {...register('type')}
            aria-invalid={Boolean(errors.type)}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type ? (
            <p className="text-destructive mt-1 text-xs">
              {errors.type.message}
            </p>
          ) : null}
        </label>

        <label className="block text-sm font-medium">
          Priority
          <select
            className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            {...register('priority')}
            aria-invalid={Boolean(errors.priority)}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.priority ? (
            <p className="text-destructive mt-1 text-xs">
              {errors.priority.message}
            </p>
          ) : null}
        </label>
      </div>

      <label className="block text-sm font-medium">
        Assignee ID (optional)
        <input
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          {...register('assigneeId')}
          aria-invalid={Boolean(errors.assigneeId)}
        />
        {errors.assigneeId ? (
          <p className="text-destructive mt-1 text-xs">
            {errors.assigneeId.message}
          </p>
        ) : null}
      </label>

      {serverError ? (
        <p className="text-destructive text-sm">{serverError}</p>
      ) : null}

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting…' : 'Submit request'}
      </Button>
    </form>
  )
}
