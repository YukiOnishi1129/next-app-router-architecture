'use client'

import { RequestFormPresenter } from './RequestFormPresenter'
import { useRequestForm } from './useRequestForm'

export function RequestFormContainer() {
  const {
    form,
    handleSubmit,
    typeOptions,
    priorityOptions,
    serverError,
    isSubmitting,
  } = useRequestForm()

  return (
    <RequestFormPresenter
      form={form}
      onSubmit={handleSubmit}
      typeOptions={typeOptions}
      priorityOptions={priorityOptions}
      serverError={serverError}
      isSubmitting={isSubmitting}
    />
  )
}
