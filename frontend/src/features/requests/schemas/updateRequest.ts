import { z } from 'zod'

import { createRequestSchema } from './createRequest'

export const updateRequestFormSchema = createRequestSchema.extend({
  requestId: z
    .uuid({ message: 'Invalid request ID' })
    .min(1, 'Request ID is required'),
})

export type UpdateRequestFormValues = z.input<typeof updateRequestFormSchema>

export const mapUpdateRequestFormToInput = (
  values: UpdateRequestFormValues
) => ({
  requestId: values.requestId,
  title: values.title.trim(),
  description: values.description.trim(),
  type: values.type,
  priority: values.priority,
})
