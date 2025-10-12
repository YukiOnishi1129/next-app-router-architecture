'use client'

import { useMemo } from 'react'

import { usePathname } from 'next/navigation'

import type { Route } from 'next'

export type SidebarNavItem = {
  href: Route
  label: string
  isActive: boolean
}

const NAV_ITEMS: Array<{
  href: Route
  label: string
  isActive: (path: string) => boolean
}> = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    isActive: (path) => path.startsWith('/dashboard'),
  },
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
    href: '/settings/profile',
    label: 'Settings',
    isActive: (path) => path.startsWith('/settings'),
  },
]

export const useSidebarNav = () => {
  const pathname = usePathname()

  const items = useMemo<SidebarNavItem[]>(() => {
    return NAV_ITEMS.map(({ href, label, isActive }) => ({
      href,
      label,
      isActive: pathname ? isActive(pathname) : false,
    }))
  }, [pathname])

  return { items }
}
