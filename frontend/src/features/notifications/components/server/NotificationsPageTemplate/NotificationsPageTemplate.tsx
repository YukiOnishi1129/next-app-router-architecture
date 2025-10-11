import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { NotificationsList } from '@/features/notifications/components/client/NotificationsList'
import { notificationKeys } from '@/features/notifications/queries/keys'

import { getQueryClient } from '@/shared/lib/query-client'

import { listNotificationsServer } from '@/external/handler/notification/query.server'

export async function NotificationsPageTemplate() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: notificationKeys.list(false),
    queryFn: async () => {
      const response = await listNotificationsServer()
      if (!response.success || !response.notifications) {
        throw new Error(response.error ?? 'Failed to load notifications')
      }
      return response
    },
  })

  return (
    <section className="space-y-6 px-6 py-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NotificationsList />
      </HydrationBoundary>
    </section>
  )
}
