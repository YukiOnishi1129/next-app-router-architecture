'use client'

import { Button } from '@/shared/components/ui/button'

import type { SignOutButtonPresenterProps } from './useSignOutButton'

export function SignOutButtonPresenter({
  onSignOut,
  isSigningOut,
}: SignOutButtonPresenterProps) {
  return (
    <Button type="button" variant="outline" onClick={onSignOut} disabled={isSigningOut}>
      {isSigningOut ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
