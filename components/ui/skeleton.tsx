import { cn } from "@/lib/utils";

/**
 * Generic Skeleton component for loading states
 *
 * This component creates a pulsing gray placeholder that can be used
 * to indicate loading content. It accepts all standard div props.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-48" />
 * <Skeleton className="h-12 w-full rounded-md" />
 * ```
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  );
}

type JobCardSkeletonProps = {
  /** Number of skeleton cards to render. Defaults to 3. */
  count?: number;
};

/**
 * JobCardSkeleton component
 *
 * Loading skeleton for job cards displayed on the homepage.
 * Matches the structure of the actual job card: hero image, title,
 * location/salary row, and excerpt.
 *
 * @example
 * ```tsx
 * <div className="grid gap-4 md:grid-cols-3">
 *   <JobCardSkeleton count={3} />
 * </div>
 * ```
 */
export function JobCardSkeleton({ count = 3 }: JobCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)]"
        >
          {/* Hero Image Skeleton */}
          <Skeleton className="aspect-video w-full rounded-none" />

          {/* Card Content */}
          <div className="p-6 space-y-4">
            {/* Title Skeleton */}
            <Skeleton className="h-6 w-3/4" />

            {/* Location and Salary Row */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Excerpt Skeleton (3 lines) */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </article>
      ))}
    </>
  );
}

type NewsListSkeletonProps = {
  /** Number of skeleton cards to render. Defaults to 5. */
  count?: number;
};

/**
 * NewsListSkeleton component
 *
 * Loading skeleton for news list items displayed on the news listing page.
 * Matches the Card structure: badge, date, title, excerpt, and button.
 *
 * @example
 * ```tsx
 * <div className="grid gap-4">
 *   <NewsListSkeleton count={5} />
 * </div>
 * ```
 */
export function NewsListSkeleton({ count = 5 }: NewsListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          {/* Card Header */}
          <div className="p-6 space-y-3">
            {/* Badge and Date Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>

            {/* Title Skeleton */}
            <Skeleton className="h-6 w-4/5" />
          </div>

          {/* Card Content */}
          <div className="px-6 pb-4">
            {/* Excerpt Skeleton (2 lines) */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-6 pb-6">
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

type JobListingCardSkeletonProps = {
  /** Number of skeleton cards to render. Defaults to 6. */
  count?: number;
};

/**
 * JobListingCardSkeleton component
 *
 * Loading skeleton for job listing cards displayed on the jobs listing page.
 * Matches the structure of JobsListingGrid: Card with badges, title,
 * salary, employment, benefits, tags, and action button.
 *
 * @example
 * ```tsx
 * <div className="grid gap-4 md:grid-cols-2">
 *   <JobListingCardSkeleton count={6} />
 * </div>
 * ```
 */
export function JobListingCardSkeleton({
  count = 6,
}: JobListingCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          {/* Card Header */}
          <div className="p-6 space-y-2">
            {/* Badges Row: urgent, category, location, date */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-2" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* Title Skeleton */}
            <Skeleton className="h-6 w-3/4" />
          </div>

          {/* Card Content */}
          <div className="px-6 pb-3 space-y-3">
            {/* Salary Text */}
            <Skeleton className="h-4 w-48" />

            {/* Employment Type */}
            <Skeleton className="h-3 w-32" />

            {/* Benefits */}
            <Skeleton className="h-3 w-40" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-6 pb-6">
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
}
