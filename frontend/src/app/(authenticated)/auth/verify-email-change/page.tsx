import { VerifyEmailChangePageTemplate } from '@/features/auth/components/server/VerifyEmailChangePageTemplate'

export default async function VerifyEmailChangePage(
  props: PageProps<'/auth/verify-email-change'>
) {
  const searchParams = await props.searchParams
  const oobCodeParam = Array.isArray(searchParams.oobCode)
    ? searchParams.oobCode[0]
    : searchParams.oobCode

  return (
    <VerifyEmailChangePageTemplate
      oobCode={oobCodeParam}
    />
  )
}
