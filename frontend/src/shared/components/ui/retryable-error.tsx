'use client'

import { Button } from './button'
import { EmptyState } from './empty-state'

type RetryableErrorProps = {
  title: string
  description?: string
  onRetry: () => void
  retryLabel?: string
}

export function RetryableError({
  title,
  description,
  onRetry,
  retryLabel = 'Retry',
}: RetryableErrorProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      actions={
        <Button type="button" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      }
    />
  )
}
