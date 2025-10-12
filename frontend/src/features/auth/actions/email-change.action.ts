'use server'

import {
  deleteEmailChangePreviousEmailCookieServer,
  setEmailChangePreviousEmailCookieServer,
} from '@/features/auth/servers/email-change.server'

export const setEmailChangePreviousEmailCookieAction = async (
  email?: string | null
) => {
  if (!email) return
  await setEmailChangePreviousEmailCookieServer(email)
}

export const deleteEmailChangePreviousEmailCookieAction = async () => {
  await deleteEmailChangePreviousEmailCookieServer()
}
