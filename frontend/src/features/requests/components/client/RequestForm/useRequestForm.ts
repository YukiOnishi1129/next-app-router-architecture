'use client'

import { useCallback, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { useAccountListQuery } from '@/features/account/hooks/query/useAccountListQuery'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import { requestKeys } from '@/features/requests/queries/keys'
import {
  createRequestSchema,
  mapCreateRequestFormToInput,
} from '@/features/requests/schemas'
import { RequestPriority, RequestType } from '@/features/requests/types'

import { formatEnumLabel } from '@/shared/lib/format'

import { createRequestAction } from '@/external/handler/request/command.action'

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

  const { session } = useAuthSession()
  const canAssignRequests = session?.account?.roles?.includes('ADMIN') ?? false
  const currentAccountId = session?.account?.id ?? null
  const assignableAccountsInput = useMemo(
    () => ({
      limit: 100,
    }),
    []
  )
  const accountListQuery = useAccountListQuery({
    enabled: canAssignRequests,
    input: assignableAccountsInput,
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

  const assigneeOptions = useMemo(() => {
    const accounts = accountListQuery.data?.accounts ?? []
    return accounts
      .filter((account) => account.id !== currentAccountId)
      .map((account) => ({
        value: account.id,
        label: `${account.name} (${account.email})`,
      }))
  }, [accountListQuery.data?.accounts, currentAccountId])

  const isAssigneeOptionsLoading =
    canAssignRequests &&
    (accountListQuery.isLoading || accountListQuery.isFetching)
  const isAssigneeSelectDisabled = !canAssignRequests
  const assigneeHelperText = !canAssignRequests
    ? 'Only administrators can assign a request to a specific approver.'
    : accountListQuery.isError
      ? 'Unable to load assignee options.'
      : assigneeOptions.length === 0
        ? 'No other accounts are available to assign at the moment.'
        : null

  return {
    form,
    handleSubmit,
    typeOptions,
    priorityOptions,
    serverError,
    isSubmitting: mutation.isPending || form.formState.isSubmitting,
    assigneeOptions,
    isAssigneeOptionsLoading,
    isAssigneeSelectDisabled,
    assigneeHelperText,
  }
}
