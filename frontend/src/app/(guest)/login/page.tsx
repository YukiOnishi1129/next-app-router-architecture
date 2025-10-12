import { LoginPageTemplate } from '@/features/auth/components/server/LoginPageTemplate'

export default async function LoginPage(props: PageProps<'/login'>) {
  const searchParams = await props.searchParams
  const passwordUpdatedParam = Array.isArray(searchParams.passwordUpdated)
    ? searchParams.passwordUpdated[0]
    : searchParams.passwordUpdated

  const passwordUpdated =
    passwordUpdatedParam === '1' || passwordUpdatedParam === 'true'

  const passwordResetParam = Array.isArray(searchParams.passwordReset)
    ? searchParams.passwordReset[0]
    : searchParams.passwordReset

  const passwordReset =
    passwordResetParam === '1' || passwordResetParam === 'true'

  return (
    <LoginPageTemplate
      passwordUpdated={passwordUpdated}
      passwordReset={passwordReset}
    />
  )
}
