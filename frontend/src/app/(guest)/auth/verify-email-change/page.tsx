import { VerifyEmailChangePageTemplate } from '@/features/auth/components/server/VerifyEmailChangePageTemplate'

export default async function VerifyEmailChangePage(
  props: PageProps<'/auth/verify-email-change'>
) {
  const params = await props.searchParams
  const oobCode = Array.isArray(params.oobCode)
    ? params.oobCode[0]
    : params.oobCode
  return <VerifyEmailChangePageTemplate oobCode={oobCode} />
}
