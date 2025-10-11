'use client'

const FALLBACK_PLACEHOLDER = '—'

export function renderIdentity(
  name: string | null | undefined,
  fallback: string = FALLBACK_PLACEHOLDER
) {
  if (name && name.trim().length > 0) {
    return <span>{name}</span>
  }
  return <span>{fallback}</span>
}
