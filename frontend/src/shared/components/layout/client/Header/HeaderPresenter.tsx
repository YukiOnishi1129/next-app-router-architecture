'use client'

import Link from 'next/link'

import { SignOutButton } from '@/features/auth/components/client/SignOutButton/SignOutButton'

import type { Route } from 'next'

type HeaderPresenterProps = {
  navItems: Array<{ href: Route; label: string }>
}

export function HeaderPresenter({ navItems }: HeaderPresenterProps) {
  return (
    <header className="border-border flex h-14 items-center justify-between border-b px-6">
      <div className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        Request &amp; Approval System
      </div>
      <div className="flex items-center gap-4">
        <nav className="text-muted-foreground flex items-center gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </div>
    </header>
  )
}
