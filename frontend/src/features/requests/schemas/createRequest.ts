import { z } from 'zod'

import { RequestPriority, RequestType } from '@/features/requests/types'

export const createRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description must be 5000 characters or fewer'),
  type: z
    .enum(RequestType)
    .refine((val) => Object.values(RequestType).includes(val), {
      message: 'Select a request type',
    }),
  priority: z
    .enum(RequestPriority)
    .refine((val) => Object.values(RequestPriority).includes(val), {
      message: 'Select a priority',
    }),
  assigneeId: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || z.string().uuid().safeParse(value).success,
      'Assignee ID must be a valid UUID'
    ),
})

export type CreateRequestFormValues = z.input<typeof createRequestSchema>

export const mapCreateRequestFormToInput = (
  values: CreateRequestFormValues
) => ({
  title: values.title.trim(),
  description: values.description.trim(),
  type: values.type,
  priority: values.priority,
  assigneeId: values.assigneeId?.trim() || undefined,
})

export type CreateRequestInput = ReturnType<typeof mapCreateRequestFormToInput>
