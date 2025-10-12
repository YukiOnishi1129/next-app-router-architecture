import { PasswordResetForm } from '@/features/auth/components/client/PasswordResetForm'

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
      <PasswordResetForm />
    </section>
  )
}
