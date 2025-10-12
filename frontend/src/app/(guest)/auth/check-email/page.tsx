import { CheckEmailPageTemplate } from '@/features/auth/components/server/CheckEmailPageTemplate'

export default async function CheckEmailPage(
  props: PageProps<'/auth/check-email'>
) {
  await props.searchParams
  return <CheckEmailPageTemplate />
}
