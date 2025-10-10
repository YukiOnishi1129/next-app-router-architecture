import { render, screen, fireEvent } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProfileFormContainer } from './ProfileFormContainer'

import type {
  ProfileFormPresenterProps,
  UseProfileFormResult,
} from './useProfileForm'

vi.mock('./ProfileFormPresenter', () => ({
  ProfileFormPresenter: () => <div data-testid="profile-form-presenter" />,
}))

const mockUseProfileForm = vi.fn<() => UseProfileFormResult>()

vi.mock('./useProfileForm', () => ({
  useProfileForm: () => mockUseProfileForm(),
}))

afterEach(() => {
  mockUseProfileForm.mockReset()
})

describe('ProfileFormContainer', () => {
  it('renders loading state', () => {
    mockUseProfileForm.mockReturnValue({ status: 'loading' })

    render(<ProfileFormContainer />)

    expect(screen.getByText('Loading profile information…')).toBeInTheDocument()
  })

  it('renders error state and retries on click', () => {
    const retry = vi.fn()
    mockUseProfileForm.mockReturnValue({
      status: 'error',
      message: 'Something went wrong',
      retry,
    })

    render(<ProfileFormContainer />)

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(retry).toHaveBeenCalledTimes(1)
  })

  it('renders presenter when ready', () => {
    const presenterProps: ProfileFormPresenterProps = {
      register: vi.fn() as unknown as ProfileFormPresenterProps['register'],
      errors: {},
      canSubmit: true,
      onSubmit: vi.fn(),
      onReset: vi.fn(),
      successMessage: null,
      updateError: null,
      isUpdating: false,
    }

    mockUseProfileForm.mockReturnValue({
      status: 'ready',
      props: presenterProps,
    })

    render(<ProfileFormContainer />)

    expect(screen.getByTestId('profile-form-presenter')).toBeInTheDocument()
  })
})
