'use client'

import { useCallback, useState } from 'react'

export const usePasswordInput = () => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  return {
    showPassword,
    togglePasswordVisibility,
  }
}
