'use client'

import { HeaderPresenter } from './HeaderPresenter'
import { useHeaderNav } from './useHeaderNav'

export function HeaderContainer() {
  const { items } = useHeaderNav()
  return <HeaderPresenter navItems={items} />
}
