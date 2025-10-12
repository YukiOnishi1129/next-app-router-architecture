'use server'

import { confirmEmailVerificationServer } from '@/external/handler/auth/command.server'

export async function confirmEmailAction(oobCode: string) {
  return confirmEmailVerificationServer(oobCode)
}
