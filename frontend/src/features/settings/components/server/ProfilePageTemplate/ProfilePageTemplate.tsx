import { ProfileForm } from '@/features/settings/components/client/ProfileForm/ProfileForm'

import { Card } from '@/shared/components/ui/card'

export async function ProfilePageTemplate() {
  return (
    <section className="space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal details and notification preferences.
        </p>
      </header>

      <Card className="p-6">
        <ProfileForm />
      </Card>
    </section>
  )
}
