import { LoginPageTemplate } from '@/features/auth/components/server/LoginPageTemplate'

export default async function LoginPage(
  props: PageProps<'/login'>
) {
  const searchParams = await props.searchParams
  const passwordUpdatedParam = Array.isArray(searchParams.passwordUpdated)
    ? searchParams.passwordUpdated[0]
    : searchParams.passwordUpdated

  const passwordUpdated =
    passwordUpdatedParam === '1' || passwordUpdatedParam === 'true'

  return <LoginPageTemplate passwordUpdated={passwordUpdated} />
}
