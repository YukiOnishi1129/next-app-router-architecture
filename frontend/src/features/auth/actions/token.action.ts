'use server'

import { deleteAuthCookiesServer } from '@/features/auth/servers/token.server'

export const deleteAuthCookiesAction = async () => {
  await deleteAuthCookiesServer()
}
