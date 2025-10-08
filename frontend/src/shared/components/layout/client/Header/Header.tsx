'use client'

import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Request &amp; Approval System
      </div>
      <nav className="flex items-center gap-4 text-sm text-muted-foreground">
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
  );
}
