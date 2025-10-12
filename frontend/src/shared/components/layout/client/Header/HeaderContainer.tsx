'use client'

import { useSignOutButton } from '@/features/auth/components/client/SignOutButton/useSignOutButton'

import { HeaderPresenter } from './HeaderPresenter'
import { useHeaderNav } from './useHeaderNav'

export function HeaderContainer() {
  const {
    unreadCount,
    isAccountMenuOpen,
    toggleAccountMenu,
    closeAccountMenu,
    accountMenuRef,
  } = useHeaderNav()
  const { onSignOut, isSigningOut } = useSignOutButton()

  return (
    <HeaderPresenter
      unreadCount={unreadCount}
      isAccountMenuOpen={isAccountMenuOpen}
      onAccountMenuToggle={toggleAccountMenu}
      onAccountMenuClose={closeAccountMenu}
      accountMenuRef={accountMenuRef}
      onSignOut={onSignOut}
      isSigningOut={isSigningOut}
    />
  )
}
