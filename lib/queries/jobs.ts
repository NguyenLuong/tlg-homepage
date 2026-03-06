import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/http/api-client";

import { queryKeys } from "./keys";

// ── Types ──────────────────────────────────────────────────

/**
 * Job status enum matching Prisma PostStatus
 */
export type JobStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED";

/**
 * Job summary item returned by GET /api/admin/jobs list endpoint
 */
export type JobListItem = {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  isFeatured: boolean;
  salaryText: string;
  benefits: string[];
  publishAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
  prefecture: {
    id: string;
    nameJP: string | null;
    nameVN: string;
    code: string;
  };
};

/**
 * Response from GET /api/admin/jobs (list)
 */
export type JobListResponse = {
  items: JobListItem[];
};

/**
 * Job detail data for admin editor (dates as ISO strings from API)
 */
export type JobDetailData = {
  id: string;
  title: string;
  slug: string;
  heroImageId: string | null;
  locationPrefectureId: string;
  salaryText: string;
  benefits: string[];
  descriptionRich: Record<string, unknown>;
  status: JobStatus;
  isFeatured: boolean;
  publishAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
};

/**
 * Prefecture for admin dropdowns
 */
export type Prefecture = {
  id: string;
  nameJP: string | null;
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

/**
 * Complete response from GET /api/admin/jobs/[id]
 */
export type JobDetailResponse = {
  job: JobDetailData;
  prefectures: Prefecture[];
  mediaAssets: MediaAsset[];
};

// ── Query Hooks ────────────────────────────────────────────

/**
 * Fetch job detail by ID for admin editor
 *
 * @param id - Job post UUID
 * @param initialData - Optional SSR data to hydrate the cache
 * @returns Query result with job, categories, prefectures, tags, and media assets
 *
 * @example
 * ```tsx
 * // In a client component with SSR data
 * const { data, isLoading, error } = useJobDetail(jobId, initialData);
 *
 * // Access the data
 * const job = data.job;
 * const categories = data.categories;
 * const prefectures = data.prefectures;
 * const tags = data.tags;
 * const mediaAssets = data.mediaAssets;
 * ```
 */
export function useJobDetail(
  id: string,
  initialData?: JobDetailResponse,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => api.get<JobDetailResponse>(`/api/admin/jobs/${id}`),
    initialData,
    enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  });
}

/**
 * Prefetch job detail for optimistic navigation
 *
 * Use this hook to prefetch data on hover or before navigation
 * to provide instant loading when the user navigates.
 *
 * @returns Prefetch function
 *
 * @example
 * ```tsx
 * const prefetchJob = usePrefetchJobDetail();
 *
 * <Link
 *   href={`/admin/jobs/${jobId}`}
 *   onMouseEnter={() => prefetchJob(jobId)}
 * >
 *   Edit Job
 * </Link>
 * ```
 */
export function usePrefetchJobDetail() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.detail(id),
      queryFn: () => api.get<JobDetailResponse>(`/api/admin/jobs/${id}`),
    });
  };
}

// ── List Hooks ─────────────────────────────────────────────

/**
 * Fetch jobs list for admin list page
 *
 * @param initialData - Optional SSR data to hydrate the cache
 * @returns Query result with job items array
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useJobsList(initialData);
 * const items = data.items;
 * ```
 */
export function useJobsList(initialData?: JobListResponse) {
  return useQuery({
    queryKey: queryKeys.jobs.lists(),
    queryFn: () => api.get<JobListResponse>("/api/admin/jobs"),
    initialData,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });
}

/**
 * Prefetch jobs list for optimistic navigation
 *
 * @returns Prefetch function
 */
export function usePrefetchJobsList() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.jobs.lists(),
      queryFn: () => api.get<JobListResponse>("/api/admin/jobs"),
      staleTime: 60 * 1000,
    });
  };
}

// ── Mutation Hooks ─────────────────────────────────────────

/**
 * Delete a job by ID. Sends DELETE /api/admin/jobs/:id?confirm=true
 * and invalidates the jobs list cache on success.
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ id: string; deleted: boolean }>(
        `/api/admin/jobs/${id}?confirm=true`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
}

/**
 * Publish a job (DRAFT or SCHEDULED → PUBLISHED).
 * Sends POST /api/admin/jobs/:id/publish.
 */
export function usePublishJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<unknown>(`/api/admin/jobs/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
}

/**
 * Unpublish a job (PUBLISHED → DRAFT).
 * Sends POST /api/admin/jobs/:id/unpublish.
 */
export function useUnpublishJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<unknown>(`/api/admin/jobs/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
}

/**
 * Toggle featured state of a job.
 * Sends PATCH /api/admin/jobs/:id/feature with { isFeatured }.
 * Only PUBLISHED jobs can be featured; at most 3 can be featured at once.
 */
export function useFeatureJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      api.patch<{ id: string; isFeatured: boolean }>(
        `/api/admin/jobs/${id}/feature`,
        { isFeatured },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
}
