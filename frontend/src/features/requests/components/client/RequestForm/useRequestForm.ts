'use client'

import { useCallback } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  createRequestSchema,
  mapCreateRequestFormToInput,
} from '@/features/requests/schemas'

import type {
  CreateRequestFormValues,
  CreateRequestInput,
} from '@/features/requests/schemas'

type HandleSubmit = (
  event: React.FormEvent<HTMLFormElement>,
  submit: (input: CreateRequestInput) => Promise<void> | void
) => void

export const useRequestForm = () => {
  const form = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      title: '',
      amount: '',
      reason: '',
    },
  })

  const handleSubmit = useCallback<HandleSubmit>(
    (event, submit) => {
      void form.handleSubmit(async (values) => {
        const normalized = mapCreateRequestFormToInput(values)
        await submit(normalized)
      })(event)
    },
    [form]
  )

  return {
    form,
    handleSubmit,
  }
}
