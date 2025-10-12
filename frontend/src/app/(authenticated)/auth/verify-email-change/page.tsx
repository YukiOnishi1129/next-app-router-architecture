import { VerifyEmailChangePageTemplate } from '@/features/auth/components/server/VerifyEmailChangePageTemplate'

export default async function VerifyEmailChangePage(
  _props: PageProps<'/auth/verify-email-change'>
) {
  return <VerifyEmailChangePageTemplate />
}
