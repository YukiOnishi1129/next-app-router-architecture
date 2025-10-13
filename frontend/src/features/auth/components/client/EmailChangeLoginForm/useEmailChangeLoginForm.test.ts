import { signIn } from 'next-auth/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteEmailChangePreviousEmailCookieAction } from '@/features/auth/actions/email-change.action'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useEmailChangeLoginForm } from './useEmailChangeLoginForm'

const mockRouter = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react')
  return {
    ...actual,
    signIn: vi.fn(),
  }
})

vi.mock('@/features/auth/actions/email-change.action', () => ({
  deleteEmailChangePreviousEmailCookieAction: vi.fn(),
}))

const mockedSignIn = vi.mocked(signIn)
const mockedDeleteCookie = vi.mocked(deleteEmailChangePreviousEmailCookieAction)

describe('useEmailChangeLoginForm', () => {
  beforeEach(() => {
    mockedSignIn.mockReset()
    mockedDeleteCookie.mockReset()
    mockRouter.replace.mockReset()
    mockRouter.refresh.mockReset()
  })

  it('submits credentials and clears cookie on success', async () => {
    mockedSignIn.mockResolvedValueOnce({ error: undefined })

    const { result } = renderHook(() =>
      useEmailChangeLoginForm('old@example.com')
    )

    const prevEmailField = result.current.register('previousEmail')
    const newEmailField = result.current.register('email')
    const passwordField = result.current.register('password')

    await act(async () => {
      prevEmailField.onChange?.({
        target: { name: 'previousEmail', value: 'old@example.com' },
      } as never)
      newEmailField.onChange?.({
        target: { name: 'email', value: 'new@example.com' },
      } as never)
      passwordField.onChange?.({
        target: { name: 'password', value: 'secretpass' },
      } as never)
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    await waitFor(() => expect(mockedSignIn).toHaveBeenCalled())
    expect(mockedDeleteCookie).toHaveBeenCalled()
    expect(result.current.serverError).toBeNull()
  })

  it('sets server error when sign-in fails', async () => {
    mockedSignIn.mockResolvedValueOnce({ error: 'Failed sign-in' })

    const { result } = renderHook(() => useEmailChangeLoginForm())

    const prevEmailField = result.current.register('previousEmail')
    const newEmailField = result.current.register('email')
    const passwordField = result.current.register('password')

    await act(async () => {
      prevEmailField.onChange?.({
        target: { name: 'previousEmail', value: 'old@example.com' },
      } as never)
      newEmailField.onChange?.({
        target: { name: 'email', value: 'new@example.com' },
      } as never)
      passwordField.onChange?.({
        target: { name: 'password', value: 'secretpass' },
      } as never)
      await result.current.onSubmit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe('Failed sign-in')
    )
    expect(mockedDeleteCookie).not.toHaveBeenCalled()
  })
})
