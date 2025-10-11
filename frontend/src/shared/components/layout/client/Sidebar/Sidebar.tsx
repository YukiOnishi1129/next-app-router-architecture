'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/shared/lib/utils'

import type { Route } from 'next'

type NavItem = {
  href: Route
  label: string
  isActive: (path: string) => boolean
}

const navItems: NavItem[] = [
  {
    href: '/requests',
    label: 'My Requests',
    isActive: (path) =>
      path === '/requests' ||
      (path.startsWith('/requests/') && !path.startsWith('/requests/new')),
  },
  {
    href: '/approvals',
    label: 'Approvals',
    isActive: (path) => path.startsWith('/approvals'),
  },
  {
    href: '/notifications',
    label: 'Notifications',
    isActive: (path) => path.startsWith('/notifications'),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    isActive: (path) => path.startsWith('/dashboard'),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="border-border bg-muted/50 hidden w-64 border-r md:block">
      <div className="text-muted-foreground px-6 py-6 text-xs font-medium tracking-wide uppercase">
        Navigation
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = pathname ? item.isActive(pathname) : false
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'hover:bg-muted rounded-md px-4 py-2 text-sm transition',
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
