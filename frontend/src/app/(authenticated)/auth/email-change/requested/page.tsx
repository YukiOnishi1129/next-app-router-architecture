import { EmailChangeRequestedPageTemplate } from '@/features/auth/components/server/EmailChangeRequestedPageTemplate'

export default async function EmailChangeRequestedPage(
  props: PageProps<'/auth/email-change/requested'>
) {
  await props.searchParams
  return <EmailChangeRequestedPageTemplate />
}
