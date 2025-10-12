import { EmailChangeCompletePageTemplate } from '@/features/auth/components/server/EmailChangeCompletePageTemplate'

export default async function EmailChangeCompletePage(
  props: PageProps<'/auth/email-change/complete'>
) {
  await props.searchParams
  return <EmailChangeCompletePageTemplate />
}
