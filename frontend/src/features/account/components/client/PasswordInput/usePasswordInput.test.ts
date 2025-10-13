import { act, renderHook } from '@/test/test-utils'

import { usePasswordInput } from './usePasswordInput'

describe('usePasswordInput', () => {
  it('toggles showPassword state', () => {
    const { result } = renderHook(() => usePasswordInput())

    expect(result.current.showPassword).toBe(false)

    act(() => {
      result.current.togglePasswordVisibility()
    })

    expect(result.current.showPassword).toBe(true)
  })
})
