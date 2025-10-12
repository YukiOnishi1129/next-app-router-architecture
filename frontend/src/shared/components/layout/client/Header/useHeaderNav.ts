'use client'

import { useMemo } from 'react'

import type { Route } from 'next'

type HeaderNavItem = {
  href: Route
  label: string
}

const NAV_ITEMS: HeaderNavItem[] = [
  { href: '/requests', label: 'Requests' },
  { href: '/approvals', label: 'Approvals' },
  { href: '/settings/profile', label: 'Settings' },
]

export const useHeaderNav = () => {
  const items = useMemo(() => NAV_ITEMS, [])
  return { items }
}
