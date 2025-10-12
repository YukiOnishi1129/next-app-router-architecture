'use client'

import Link from 'next/link'

import { Bell, UserCircle2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import type { RefObject } from 'react'

type HeaderPresenterProps = {
  unreadCount: number
  isAccountMenuOpen: boolean
  onAccountMenuToggle: () => void
  onAccountMenuClose: () => void
  accountMenuRef: RefObject<HTMLDivElement | null>
  onSignOut: () => void
  isSigningOut: boolean
}

export function HeaderPresenter({
  unreadCount,
  isAccountMenuOpen,
  onAccountMenuToggle,
  onAccountMenuClose,
  accountMenuRef,
  onSignOut,
  isSigningOut,
}: HeaderPresenterProps) {
  return (
    <header className="border-border flex h-14 items-center justify-between border-b px-6">
      <div className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        Request &amp; Approval System
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="text-muted-foreground hover:text-foreground relative transition"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-semibold">
              {unreadCount}
            </span>
          ) : null}
        </Link>
        <div ref={accountMenuRef} className="relative">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
            aria-haspopup="menu"
            aria-expanded={isAccountMenuOpen}
            onClick={onAccountMenuToggle}
          >
            <UserCircle2 className="h-6 w-6" />
            <span className="sr-only">Account menu</span>
          </button>
          <div
            className={cn(
              'bg-popover text-popover-foreground border-border absolute top-full right-0 z-20 mt-2 w-40 rounded-md border py-2 text-sm shadow-md transition',
              isAccountMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
            )}
            role="menu"
          >
            <Link
              href="/settings/profile"
              className="hover:bg-muted flex w-full px-3 py-2"
              role="menuitem"
              onClick={onAccountMenuClose}
            >
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              className="hover:bg-muted flex w-full px-3 py-2 text-left text-sm"
              onClick={() => {
                onAccountMenuClose()
                onSignOut()
              }}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
