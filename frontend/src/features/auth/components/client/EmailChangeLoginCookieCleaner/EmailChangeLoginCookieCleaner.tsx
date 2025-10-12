'use client'

import { useEffect } from 'react'

import { deleteEmailChangePreviousEmailCookieAction } from '@/features/auth/actions/email-change.action'

type EmailChangeLoginCookieCleanerProps = {
  enabled?: boolean
}

export const EmailChangeLoginCookieCleaner = ({
  enabled = false,
}: EmailChangeLoginCookieCleanerProps) => {
  useEffect(() => {
    if (!enabled) return
    void deleteEmailChangePreviousEmailCookieAction()
  }, [enabled])

  return null
}
