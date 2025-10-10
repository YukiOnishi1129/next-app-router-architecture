'use client'

import { forwardRef } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

import type { InputHTMLAttributes } from 'react'

export type PasswordInputPresenterProps =
  InputHTMLAttributes<HTMLInputElement> & {
    showPassword: boolean
    onTogglePasswordVisibility: () => void
    hideToggle?: boolean
  }

export const PasswordInputPresenter = forwardRef<
  HTMLInputElement,
  PasswordInputPresenterProps
>(
  (
    {
      className,
      showPassword,
      onTogglePasswordVisibility,
      hideToggle,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(hideToggle ? '' : 'pr-10', className)}
          {...props}
        />
        {!hideToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
            onClick={onTogglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="text-muted-foreground h-4 w-4" />
            ) : (
              <Eye className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    )
  }
)

PasswordInputPresenter.displayName = 'PasswordInputPresenter'
