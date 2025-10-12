import { VerifyEmailPageTemplate } from '@/features/auth/components/server/VerifyEmailPageTemplate'

export default async function VerifyEmailPage(
  props: PageProps<'/auth/verify'>
) {
  const params = await props.searchParams
  const oobCode = Array.isArray(params.oobCode)
    ? params.oobCode[0]
    : params.oobCode
  const nextPath = Array.isArray(params.next) ? params.next[0] : params.next
  return (
    <VerifyEmailPageTemplate oobCode={oobCode} nextPath={nextPath ?? null} />
  )
}
