const FALLBACK_PLACEHOLDER = '—'

export function formatIdentity(
  name: string | null | undefined,
  fallback: string = FALLBACK_PLACEHOLDER
): string {
  if (name && name.trim().length > 0) {
    return name
  }
  return fallback
}
