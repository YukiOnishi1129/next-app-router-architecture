import { Button } from '@/shared/components/ui/button'

export default function PasswordResetPage(
  _props: PageProps<'/password-reset'>
) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <p className="text-muted-foreground text-sm">
        Enter your email address and we&apos;ll send you instructions to reset
        your password.
      </p>
      <form className="space-y-3">
        <label className="block text-sm font-medium">
          Email
          <input
            className="border-border bg-background focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            type="email"
            name="email"
            required
          />
        </label>
        <Button type="submit" className="w-full sm:w-auto">
          Send instructions
        </Button>
      </form>
    </section>
  )
}
