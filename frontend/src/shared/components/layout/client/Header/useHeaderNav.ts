'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useUnreadNotificationsCount } from '@/features/notifications/hooks/useUnreadNotificationsCount'

import type { Route } from 'next'

type HeaderNavItem = {
  href: Route
  label: string
}

const NAV_ITEMS: HeaderNavItem[] = []

export const useHeaderNav = () => {
  const items = useMemo(() => NAV_ITEMS, [])
  const { count } = useUnreadNotificationsCount()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen((prev) => !prev)
  }

  const closeAccountMenu = () => setIsAccountMenuOpen(false)

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        closeAccountMenu()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAccountMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAccountMenuOpen])

  return {
    items,
    unreadCount: count,
    isAccountMenuOpen,
    toggleAccountMenu,
    closeAccountMenu,
    accountMenuRef,
  }
}
