'use client'

import { SidebarPresenter } from './SidebarPresenter'
import { useSidebarNav } from './useSidebarNav'

export function SidebarContainer() {
  const { items } = useSidebarNav()
  return <SidebarPresenter items={items} />
}
