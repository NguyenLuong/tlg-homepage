import { Card } from "@/components/ui/card";
import { JobListingCardSkeleton, Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the jobs listing page
 *
 * Shows skeleton loaders while the jobs page is loading.
 * Displays:
 * - Page header skeleton
 * - Filters card skeleton
 * - Results header skeleton
 * - Job listing cards skeleton (6 cards in 2-column grid)
 */
export default function JobsListLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      {/* Page Header Skeleton */}
      <header className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </header>

      {/* Filters Card Skeleton */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <Skeleton className="h-9 rounded-4xl" />
            <Skeleton className="h-9 rounded-4xl" />
            <Skeleton className="h-9 rounded-4xl" />
            <Skeleton className="h-9 rounded-4xl" />
            <Skeleton className="h-9 rounded-4xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </Card>

      {/* Results Header Skeleton */}
      <section className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-64" />
      </section>

      {/* Job Listing Cards Skeleton */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <JobListingCardSkeleton count={6} />
      </section>
    </div>
  );
}
