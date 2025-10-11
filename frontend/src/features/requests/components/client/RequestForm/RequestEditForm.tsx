'use client'

import { RequestFormPresenter } from './RequestFormPresenter'
import { useEditRequestForm } from './useEditRequestForm'

export function RequestEditForm({ requestId }: { requestId: string }) {
  const {
    form,
    handleSubmit,
    typeOptions,
    priorityOptions,
    serverError,
    isSubmitting,
    isLoading,
    errorMessage,
  } = useEditRequestForm(requestId)

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading request…</div>
  }

  if (errorMessage) {
    return (
      <div className="text-destructive border-destructive/40 bg-destructive/10 rounded-md border p-4 text-sm">
        {errorMessage}
      </div>
    )
  }

  return (
    <RequestFormPresenter
      form={form}
      onSubmit={handleSubmit}
      typeOptions={typeOptions}
      priorityOptions={priorityOptions}
      serverError={serverError}
      isSubmitting={isSubmitting}
      submitLabel="Save changes"
      showAssigneeField={false}
    />
  )
}
