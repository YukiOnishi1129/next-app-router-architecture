import { redirect } from 'next/navigation'

import { getSessionServer } from '@/features/auth/servers/session.server'

export default async function HomePage() {
  const session = await getSessionServer()

  redirect(session ? '/requests' : '/login')
}
