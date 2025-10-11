'use client'

import Link from 'next/link'

import { cn } from '@/shared/lib/utils'

import type { RequestsStatusTab } from './useRequestsStatusTabList'

type RequestsStatusTabListPresenterProps = {
  tabs: RequestsStatusTab[]
}

export function RequestsStatusTabListPresenter({
  tabs,
}: RequestsStatusTabListPresenterProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            'rounded-md border px-4 py-2 text-sm transition',
            tab.isActive
              ? 'border-primary bg-primary text-primary-foreground shadow'
              : 'border-border text-muted-foreground hover:border-muted-foreground'
          )}
          aria-current={tab.isActive ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
