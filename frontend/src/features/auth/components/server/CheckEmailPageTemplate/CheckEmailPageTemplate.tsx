import Link from 'next/link'

import { Button } from '@/shared/components/ui/button'

export function CheckEmailPageTemplate() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-12">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Verify your email</h1>
        <p className="text-muted-foreground text-sm">
          We sent a verification link to your inbox. Open the email and follow
          the instructions to activate your account.
        </p>
      </header>
      <div className="border-border/60 bg-muted/20 text-muted-foreground rounded-md border border-dashed p-6 text-sm">
        <p className="text-foreground font-medium">Tips</p>
        <ul className="list-disc space-y-2 pt-2 pl-4">
          <li>Check your spam folder if the email isn&apos;t in your inbox.</li>
          <li>
            The link expires after a short period. If it does, request a new one
            from the login screen.
          </li>
        </ul>
      </div>
      <div className="flex justify-center">
        <Link href="/login">
          <Button variant="outline">Back to login</Button>
        </Link>
      </div>
    </section>
  )
}
