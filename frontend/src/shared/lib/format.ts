export function formatEnumLabel(value?: string | null): string {
  if (!value) {
    return ''
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatDateTime(
  value?: string | Date | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) {
    return '—'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleString(undefined, options)
}
