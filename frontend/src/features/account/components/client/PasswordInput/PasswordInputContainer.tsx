'use client'

import { forwardRef } from 'react'

import { PasswordInputPresenter } from './PasswordInputPresenter'
import { usePasswordInput } from './usePasswordInput'

import type { InputHTMLAttributes } from 'react'

export interface PasswordInputContainerProps
  extends InputHTMLAttributes<HTMLInputElement> {
  hideToggle?: boolean
}

export const PasswordInputContainer = forwardRef<
  HTMLInputElement,
  PasswordInputContainerProps
>(({ hideToggle, ...props }, ref) => {
  const { showPassword, togglePasswordVisibility } = usePasswordInput()

  return (
    <PasswordInputPresenter
      ref={ref}
      showPassword={showPassword}
      onTogglePasswordVisibility={togglePasswordVisibility}
      hideToggle={hideToggle}
      {...props}
    />
  )
})

PasswordInputContainer.displayName = 'PasswordInputContainer'
