import { redirectIfAuthenticatedServer } from '@/features/auth/servers/redirect.server'

export async function GuestLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  await redirectIfAuthenticatedServer()

  return (
    <div className="bg-muted min-h-screen">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12">
        {children}
      </div>
    </div>
  )
}
