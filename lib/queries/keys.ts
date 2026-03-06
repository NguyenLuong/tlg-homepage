/**
 * Centralized query key factory for TanStack Query
 *
 * Hierarchical key structure for better cache invalidation
 * following TanStack Query best practices
 */

export const queryKeys = {
  news: {
    all: ["news"] as const,
    lists: () => [...queryKeys.news.all, "list"] as const,
    list: (filters?: unknown) => [...queryKeys.news.lists(), filters] as const,
    details: () => [...queryKeys.news.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.news.details(), id] as const,
  },

  jobs: {
    all: ["jobs"] as const,
    lists: () => [...queryKeys.jobs.all, "list"] as const,
    list: (filters?: unknown) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },

  messages: {
    all: ["messages"] as const,
    lists: () => [...queryKeys.messages.all, "list"] as const,
    list: (filters?: unknown) =>
      [...queryKeys.messages.lists(), filters] as const,
    details: () => [...queryKeys.messages.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.messages.details(), id] as const,
    counts: () => [...queryKeys.messages.all, "count"] as const,
    count: (type: "unread") => [...queryKeys.messages.counts(), type] as const,
  },

  // Lookups (categories, prefectures, tags, media assets)
  lookups: {
    all: ["lookups"] as const,
    newsCategories: () =>
      [...queryKeys.lookups.all, "news-categories"] as const,
    prefectures: () => [...queryKeys.lookups.all, "prefectures"] as const,
    mediaAssets: (folder?: string) =>
      [...queryKeys.lookups.all, "media", folder] as const,
  },
};
