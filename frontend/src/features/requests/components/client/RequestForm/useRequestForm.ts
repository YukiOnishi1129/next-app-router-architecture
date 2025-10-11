'use client'

import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { requestKeys } from '@/features/requests/queries/keys'
import {
  createRequestSchema,
  mapCreateRequestFormToInput,
} from '@/features/requests/schemas'
import { RequestPriority, RequestType } from '@/features/requests/types'

import { createRequestAction } from '@/external/handler/request/command.action'

import { formatEnumLabel } from '@/shared/lib/format'

import type { CreateRequestFormValues } from '@/features/requests/schemas'
import type { FormEvent } from 'react'

export const useRequestForm = () => {
  const form = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      type: RequestType.EXPENSE,
      priority: RequestPriority.MEDIUM,
      assigneeId: '',
    },
  })

  const router = useRouter()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (values: CreateRequestFormValues) => {
      const input = mapCreateRequestFormToInput(values)
      return createRequestAction(input)
    },
    onSuccess: async (result) => {
      if (result.success && result.request) {
        await queryClient.invalidateQueries({ queryKey: requestKeys.all })
        form.reset()
        router.push(`/requests/${result.request.id}`)
      } else {
        setServerError(result.error ?? 'Failed to create request')
      }
    },
    onError: () => {
      setServerError('Failed to create request')
    },
  })

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      setServerError(null)
      void form.handleSubmit(async (values) => {
        await mutation.mutateAsync(values)
      })(event)
    },
    [form, mutation]
  )

  const typeOptions = useMemo(
    () =>
      Object.values(RequestType).map((type) => ({
        value: type,
        label: formatEnumLabel(type),
      })),
    []
  )

  const priorityOptions = useMemo(
    () =>
      Object.values(RequestPriority).map((priority) => ({
        value: priority,
        label: formatEnumLabel(priority),
      })),
    []
  )

  return {
    form,
    handleSubmit,
    typeOptions,
    priorityOptions,
    serverError,
    isSubmitting: mutation.isPending || form.formState.isSubmitting,
  }
}
