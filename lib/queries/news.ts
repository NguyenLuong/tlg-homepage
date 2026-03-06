import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/http/api-client";

import { queryKeys } from "./keys";

// ── Types ──────────────────────────────────────────────────

/**
 * News summary item returned by GET /api/admin/news list endpoint
 */
export type NewsListItem = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
  category: {
    id: string;
    nameVN: string;
    slug: string;
    iconKey: string | null;
  };
};

/**
 * Response from GET /api/admin/news (list)
 */
export type NewsListResponse = {
  items: NewsListItem[];
};

/**
 * News detail data for admin editor (dates as ISO strings from API)
 */
export type NewsDetailData = {
  id: string;
  title: string;
  slug: string;
  contentRich: Record<string, unknown>;
  categoryId: string;
  status: string;
  updatedAt: string;
  publishAt: string | null;
};

/**
 * News category for admin dropdowns
 */
export type NewsCategory = {
  id: string;
  nameVN: string;
};

/**
 * Complete response from GET /api/admin/news/[id]
 */
export type NewsDetailResponse = {
  news: NewsDetailData;
  categories: NewsCategory[];
};

// ── Query Hooks ────────────────────────────────────────────

/**
 * Fetch news detail by ID for admin editor
 *
 * @param id - News post UUID
 * @param initialData - Optional SSR data to hydrate the cache
 * @returns Query result with news, categories, and media assets
 *
 * @example
 * ```tsx
 * // In a client component with SSR data
 * const { data, isLoading, error } = useNewsDetail(newsId, initialData);
 *
 * // Access the data
 * const news = data.news;
 * const categories = data.categories;
 * const mediaAssets = data.mediaAssets;
 * ```
 */
export function useNewsDetail(id: string, initialData?: NewsDetailResponse) {
  return useQuery({
    queryKey: queryKeys.news.detail(id),
    queryFn: () => api.get<NewsDetailResponse>(`/api/admin/news/${id}`),
    initialData,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  });
}

/**
 * Prefetch news detail for optimistic navigation
 *
 * Use this hook to prefetch data on hover or before navigation
 * to provide instant loading when the user navigates.
 *
 * @returns Prefetch function
 *
 * @example
 * ```tsx
 * const prefetchNews = usePrefetchNewsDetail();
 *
 * <Link
 *   href={`/admin/news/${newsId}`}
 *   onMouseEnter={() => prefetchNews(newsId)}
 * >
 *   Edit News
 * </Link>
 * ```
 */
export function usePrefetchNewsDetail() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.news.detail(id),
      queryFn: () => api.get<NewsDetailResponse>(`/api/admin/news/${id}`),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Get cached news detail without fetching
 *
 * Returns the cached data for a news item if it exists,
 * otherwise returns undefined. Does not trigger a fetch.
 *
 * @param id - News post UUID
 * @returns Cached news detail or undefined
 *
 * @example
 * ```tsx
 * const getCachedNews = useGetCachedNewsDetail();
 * const cachedData = getCachedNews(newsId);
 *
 * if (cachedData) {
 *   // Use cached data immediately
 * }
 * ```
 */
export function useGetCachedNewsDetail() {
  const queryClient = useQueryClient();

  return (id: string) => {
    return queryClient.getQueryData<NewsDetailResponse>(
      queryKeys.news.detail(id),
    );
  };
}

// ── List Hooks ─────────────────────────────────────────────

/**
 * Fetch news list for admin list page
 *
 * @param initialData - Optional SSR data to hydrate the cache
 * @returns Query result with news items array
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useNewsList(initialData);
 * const items = data.items;
 * ```
 */
export function useNewsList(initialData?: NewsListResponse) {
  return useQuery({
    queryKey: queryKeys.news.lists(),
    queryFn: () => api.get<NewsListResponse>("/api/admin/news"),
    initialData,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });
}

/**
 * Prefetch news list for optimistic navigation
 *
 * @returns Prefetch function
 */
export function usePrefetchNewsList() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.news.lists(),
      queryFn: () => api.get<NewsListResponse>("/api/admin/news"),
      staleTime: 60 * 1000,
    });
  };
}

// ── Mutation Hooks ─────────────────────────────────────────

/**
 * Delete a news post by ID. Sends DELETE /api/admin/news/:id?confirm=true
 * and invalidates the news list cache on success.
 */
export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ id: string; deleted: boolean }>(
        `/api/admin/news/${id}?confirm=true`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
    },
  });
}

/**
 * Publish a news post (DRAFT or SCHEDULED → PUBLISHED).
 * Sends POST /api/admin/news/:id/publish.
 */
export function usePublishNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<unknown>(`/api/admin/news/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
    },
  });
}

/**
 * Unpublish a news post (PUBLISHED → DRAFT).
 * Sends POST /api/admin/news/:id/unpublish.
 */
export function useUnpublishNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<unknown>(`/api/admin/news/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
    },
  });
}
