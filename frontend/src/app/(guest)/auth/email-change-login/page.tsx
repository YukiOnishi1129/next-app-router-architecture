import { EmailChangeLoginPageTemplate } from '@/features/auth/components/server/EmailChangeLoginPageTemplate'

export default async function EmailChangeLoginPage(
  props: PageProps<'/auth/email-change-login'>
) {
  const searchParams = await props.searchParams
  const verified = searchParams?.verified === '1'

  return <EmailChangeLoginPageTemplate verified={verified} />
}
