import { z } from 'zod'

export const createRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be 120 characters or fewer'),
  amount: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      'Amount must be zero or greater'
    ),
  reason: z
    .string()
    .trim()
    .min(1, 'Reason is required')
    .max(2000, 'Reason must be 2000 characters or fewer'),
})

export type CreateRequestFormValues = z.infer<typeof createRequestSchema>

export const mapCreateRequestFormToInput = (
  values: CreateRequestFormValues
) => ({
  title: values.title.trim(),
  amount: values.amount === '' ? undefined : Number(values.amount),
  reason: values.reason.trim(),
})

export type CreateRequestInput = ReturnType<typeof mapCreateRequestFormToInput>
