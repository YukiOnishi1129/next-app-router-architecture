import "server-only";

import { getSessionServer } from "@/features/auth/servers/session.server";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

export async function ProfilePageTemplate() {
  const session = await getSessionServer();

  return (
    <section className="space-y-6 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal details and notification preferences.
        </p>
      </header>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-sm font-medium">Contact information</h2>
          <p className="text-muted-foreground text-xs">
            Pulled from the authenticated session for now.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{session?.user?.name ?? "Unknown"}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{session?.user?.email ?? "Unknown"}</dd>
        </dl>

        <Button type="button" className="w-full sm:w-auto" variant="outline">
          Edit profile
        </Button>
      </Card>
    </section>
  );
}
