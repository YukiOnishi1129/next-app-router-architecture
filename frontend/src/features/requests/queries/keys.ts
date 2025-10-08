export const requestKeys = {
  all: ["requests"] as const,
  list: (filters?: unknown) =>
    filters
      ? ([...requestKeys.all, "list", filters] as const)
      : ([...requestKeys.all, "list"] as const),
  detail: (requestId: string) =>
    [...requestKeys.all, "detail", requestId] as const,
  drafts: (requesterId: string) =>
    [...requestKeys.all, "drafts", requesterId] as const,
  summary: (requesterId: string) =>
    [...requestKeys.all, "summary", requesterId] as const,
};
