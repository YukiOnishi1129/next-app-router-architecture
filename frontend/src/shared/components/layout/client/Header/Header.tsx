'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="border-border flex h-14 items-center justify-between border-b px-6">
      <div className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
        Request &amp; Approval System
      </div>
      <nav className="text-muted-foreground flex items-center gap-4 text-sm">
        <Link href="/requests" className="hover:text-foreground">
          Requests
        </Link>
        <Link href="/approvals" className="hover:text-foreground">
          Approvals
        </Link>
        <Link href="/settings/profile" className="hover:text-foreground">
          Settings
        </Link>
      </nav>
    </header>
  )
}
