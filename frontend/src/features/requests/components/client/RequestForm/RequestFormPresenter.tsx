'use client'

import { Button } from '@/shared/components/ui/button'

import type { CreateRequestFormValues } from '@/features/requests/schemas'
import type { FormEvent } from 'react'
import type { Path, UseFormReturn } from 'react-hook-form'

type Option = {
  value: string
  label: string
}

type RequestFormPresenterProps<
  TFormValues extends CreateRequestFormValues = CreateRequestFormValues,
> = {
  form: UseFormReturn<TFormValues>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  typeOptions: Option[]
  priorityOptions: Option[]
  serverError?: string | null
  isSubmitting?: boolean
  submitLabel?: string
  showAssigneeField?: boolean
  assigneeOptions?: Option[]
  assigneeOptionsLoading?: boolean
  assigneeDisabled?: boolean
  assigneeHelperText?: string | null
}

export function RequestFormPresenter<
  TFormValues extends CreateRequestFormValues = CreateRequestFormValues,
>({
  form,
  onSubmit,
  typeOptions,
  priorityOptions,
  serverError,
  isSubmitting = false,
  submitLabel = 'Submit request',
  showAssigneeField = true,
  assigneeOptions = [],
  assigneeOptionsLoading = false,
  assigneeDisabled = false,
  assigneeHelperText,
}: RequestFormPresenterProps<TFormValues>) {
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
          {...register('title' as Path<TFormValues>)}
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title?.message ? (
          <p className="text-destructive mt-1 text-xs">
            {String(errors.title.message)}
          </p>
        ) : null}
      </label>

      <label className="block text-sm font-medium">
        Description
        <textarea
          className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
          rows={4}
          {...register('description' as Path<TFormValues>)}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description?.message ? (
          <p className="text-destructive mt-1 text-xs">
            {String(errors.description.message)}
          </p>
        ) : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Type
          <select
            className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            {...register('type' as Path<TFormValues>)}
            aria-invalid={Boolean(errors.type)}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type?.message ? (
            <p className="text-destructive mt-1 text-xs">
              {String(errors.type.message)}
            </p>
          ) : null}
        </label>

        <label className="block text-sm font-medium">
          Priority
          <select
            className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            {...register('priority' as Path<TFormValues>)}
            aria-invalid={Boolean(errors.priority)}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.priority?.message ? (
            <p className="text-destructive mt-1 text-xs">
              {String(errors.priority.message)}
            </p>
          ) : null}
        </label>
      </div>

      {showAssigneeField ? (
        <label className="block text-sm font-medium">
          Assignee (optional)
          <select
            className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            {...register('assigneeId' as Path<TFormValues>)}
            aria-invalid={Boolean(errors.assigneeId)}
            disabled={assigneeDisabled}
          >
            <option value="">Unassigned</option>
            {assigneeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {assigneeOptionsLoading ? (
            <p className="text-muted-foreground mt-1 text-xs">
              Loading assignees…
            </p>
          ) : null}
          {assigneeHelperText && !errors.assigneeId?.message ? (
            <p className="text-muted-foreground mt-1 text-xs">
              {assigneeHelperText}
            </p>
          ) : null}
          {errors.assigneeId?.message ? (
            <p className="text-destructive mt-1 text-xs">
              {String(errors.assigneeId.message)}
            </p>
          ) : null}
        </label>
      ) : null}

      {serverError ? (
        <p className="text-destructive text-sm">{serverError}</p>
      ) : null}

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting…' : submitLabel}
      </Button>
    </form>
  )
}
