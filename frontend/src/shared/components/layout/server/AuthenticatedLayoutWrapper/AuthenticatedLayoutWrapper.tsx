import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'

import { Header } from '@/shared/components/layout/client/Header'
import { Sidebar } from '@/shared/components/layout/client/Sidebar'
import { getQueryClient } from '@/shared/lib/query-client'

export async function AuthenticatedLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuthServer()

  const queryClient = getQueryClient()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="bg-background text-foreground flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </HydrationBoundary>
  )
}
