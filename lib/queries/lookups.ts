import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/http/api-client";

import { queryKeys } from "./keys";

// ── Types ──────────────────────────────────────────────────

/**
 * News category for admin dropdowns
 */
export type NewsCategory = {
  id: string;
  nameVN: string;
};

/**
 * Prefecture for admin dropdowns
 */
export type Prefecture = {
  id: string;
  nameJP: string;
  nameVN: string;
  code: string;
};

/**
 * Media asset for admin media picker
 */
export type MediaAsset = {
  id: string;
  url: string;
  publicId: string;
  altText: string | null;
  width: number;
  height: number;
  bytes: number;
  mime: string;
  createdAt: string;
};

// ── Query Hooks ────────────────────────────────────────────

/**
 * Hook to fetch news categories for admin dropdowns
 *
 * @param initialData - Optional SSR data from server component
 * @returns Query result with news categories
 *
 * @example
 * ```tsx
 * // In Server Component
 * const categories = await findAdminNewsCategories();
 *
 * // In Client Component
 * const { data: categories } = useNewsCategories(categories);
 * ```
 */
export function useNewsCategories(initialData?: NewsCategory[]) {
  return useQuery({
    queryKey: queryKeys.lookups.newsCategories(),
    queryFn: () =>
      api.get<NewsCategory[]>("/api/admin/lookups/news-categories"),
    initialData,
    staleTime: 30 * 60 * 1000, // 30 minutes - categories rarely change
    gcTime: 60 * 60 * 1000, // 60 minutes in cache
  });
}

/**
 * Hook to fetch prefectures for admin dropdowns
 *
 * @param initialData - Optional SSR data from server component
 * @returns Query result with prefectures
 *
 * @example
 * ```tsx
 * // In Server Component
 * const prefectures = await findAdminPrefectures();
 *
 * // In Client Component
 * const { data: prefectures } = usePrefectures(prefectures);
 * ```
 */
export function usePrefectures(initialData?: Prefecture[]) {
  return useQuery({
    queryKey: queryKeys.lookups.prefectures(),
    queryFn: () => api.get<Prefecture[]>("/api/admin/lookups/prefectures"),
    initialData,
    staleTime: 30 * 60 * 1000, // 30 minutes - prefectures rarely change
    gcTime: 60 * 60 * 1000, // 60 minutes in cache
  });
}

/**
 * Hook to fetch media assets for admin media picker
 *
 * @param folder - Optional folder filter for media assets
 * @param initialData - Optional SSR data from server component
 * @returns Query result with media assets
 *
 * @example
 * ```tsx
 * // In Server Component
 * const mediaAssets = await findRecentMediaAssets();
 *
 * // In Client Component
 * const { data: mediaAssets } = useMediaAssets(undefined, mediaAssets);
 * ```
 */
export function useMediaAssets(folder?: string, initialData?: MediaAsset[]) {
  return useQuery({
    queryKey: queryKeys.lookups.mediaAssets(folder),
    queryFn: () => {
      const url = folder
        ? `/api/admin/lookups/media-assets?folder=${encodeURIComponent(folder)}`
        : "/api/admin/lookups/media-assets";
      return api.get<MediaAsset[]>(url);
    },
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes - media assets can change more frequently
    gcTime: 15 * 60 * 1000, // 15 minutes in cache
  });
}

// ── Prefetch Helpers ───────────────────────────────────────

/**
 * Hook to prefetch news categories (e.g., on hover/navigation)
 */
export function usePrefetchNewsCategories() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.lookups.newsCategories(),
      queryFn: () =>
        api.get<NewsCategory[]>("/api/admin/lookups/news-categories"),
    });
  };
}

/**
 * Hook to prefetch prefectures (e.g., on hover/navigation)
 */
export function usePrefetchPrefectures() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.lookups.prefectures(),
      queryFn: () => api.get<Prefecture[]>("/api/admin/lookups/prefectures"),
    });
  };
}

/**
 * Hook to prefetch media assets (e.g., on hover/navigation)
 */
export function usePrefetchMediaAssets() {
  const queryClient = useQueryClient();

  return (folder?: string) => {
    const url = folder
      ? `/api/admin/lookups/media-assets?folder=${encodeURIComponent(folder)}`
      : "/api/admin/lookups/media-assets";
    queryClient.prefetchQuery({
      queryKey: queryKeys.lookups.mediaAssets(folder),
      queryFn: () => api.get<MediaAsset[]>(url),
    });
  };
}
