import { ProfilePageTemplate } from '@/features/settings/components/server/ProfilePageTemplate'

export default async function ProfilePage(
  props: PageProps<'/settings/profile'>
) {
  const params = await props.searchParams
  const updatedParam = Array.isArray(params.updated)
    ? params.updated[0]
    : params.updated
  const updatedField =
    updatedParam === 'name' || updatedParam === 'email'
      ? updatedParam
      : undefined

  return <ProfilePageTemplate updatedField={updatedField} />
}
