export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly = false) =>
    unreadOnly
      ? ([...notificationKeys.all, 'list', 'unread'] as const)
      : ([...notificationKeys.all, 'list'] as const),
}
