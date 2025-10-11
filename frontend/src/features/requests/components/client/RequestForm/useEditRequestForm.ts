'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { updateRequestAction } from '@/features/requests/actions'
import { useRequestDetailQuery } from '@/features/requests/hooks/query/useRequestDetailQuery'
import { requestKeys } from '@/features/requests/queries/keys'
import {
  mapUpdateRequestFormToInput,
  updateRequestFormSchema,
} from '@/features/requests/schemas'

import { formatEnumLabel } from '@/shared/lib/format'

import {
  RequestPriority,
  RequestType,
} from '@/external/domain/request/request-status'

import type { UpdateRequestFormValues } from '@/features/requests/schemas'
import type { FormEvent } from 'react'

export const useEditRequestForm = (requestId: string) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const requestQuery = useRequestDetailQuery(requestId)

  const form = useForm<UpdateRequestFormValues>({
    resolver: zodResolver(updateRequestFormSchema),
    defaultValues: {
      requestId,
      title: '',
      description: '',
      type: RequestType.EXPENSE,
      priority: RequestPriority.MEDIUM,
      assigneeId: '',
    },
  })

  useEffect(() => {
    if (!requestQuery.data) {
      return
    }
    const request = requestQuery.data
    form.reset({
      requestId: request.id,
      title: request.title,
      description: request.description,
      type: request.type,
      priority: request.priority,
      assigneeId: request.assigneeId ?? '',
    })
  }, [form, requestQuery.data])

  const mutation = useMutation({
    mutationFn: async (values: UpdateRequestFormValues) => {
      const input = mapUpdateRequestFormToInput(values)
      return updateRequestAction(input)
    },
    onSuccess: async (result, values) => {
      if (result.success && result.request) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: requestKeys.detail(values.requestId),
          }),
          queryClient.invalidateQueries({
            queryKey: requestKeys.all,
          }),
          queryClient.invalidateQueries({
            queryKey: requestKeys.history(values.requestId),
          }),
        ])
        setServerError(null)
        router.push(`/requests/${values.requestId}`)
      } else {
        setServerError(result.error ?? 'Failed to update request')
      }
    },
    onError: () => {
      setServerError('Failed to update request')
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
    isLoading: requestQuery.isLoading && !requestQuery.data,
    errorMessage:
      requestQuery.error instanceof Error
        ? requestQuery.error.message
        : undefined,
  }
}
