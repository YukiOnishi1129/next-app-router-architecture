export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (params: Record<string, unknown> = {}) =>
    [...accountKeys.lists(), params] as const,
}

export type AccountListKey = ReturnType<typeof accountKeys.list>
