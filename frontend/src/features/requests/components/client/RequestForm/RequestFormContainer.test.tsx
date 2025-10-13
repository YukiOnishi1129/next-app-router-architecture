import { describe, expect, it, vi } from 'vitest'

import { RequestPriority, RequestType } from '@/features/requests/types'

import { render, screen } from '@/test/test-utils'

import { RequestFormContainer } from './RequestFormContainer'

import type { CreateRequestFormValues } from '@/features/requests/schemas'
import type { UseFormReturn } from 'react-hook-form'

const mockUseRequestForm = vi.hoisted(() => vi.fn())

vi.mock('./useRequestForm', () => ({
  useRequestForm: mockUseRequestForm,
}))

describe('RequestFormContainer', () => {
  it('renders form fields', () => {
    const fakeForm = {
      register: () => ({ onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() }),
      formState: { errors: {} },
    } as unknown as UseFormReturn<CreateRequestFormValues>

    mockUseRequestForm.mockReturnValue({
      form: fakeForm,
      handleSubmit: vi.fn(),
      typeOptions: [
        { value: RequestType.EQUIPMENT, label: 'Equipment' },
        { value: RequestType.ACCESS, label: 'Access' },
      ],
      priorityOptions: [
        { value: RequestPriority.HIGH, label: 'High' },
        { value: RequestPriority.MEDIUM, label: 'Medium' },
      ],
      serverError: null,
      isSubmitting: false,
      assigneeOptions: [],
      isAssigneeOptionsLoading: false,
      isAssigneeSelectDisabled: false,
      assigneeHelperText: null,
    })

    render(<RequestFormContainer />)

    expect(mockUseRequestForm).toHaveBeenCalled()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
  })
})
