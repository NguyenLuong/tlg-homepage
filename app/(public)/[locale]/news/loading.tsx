import { Card } from "@/components/ui/card";
import { NewsListSkeleton, Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the news listing page
 *
 * Shows skeleton loaders while the news page is loading.
 * Displays:
 * - Page header skeleton
 * - Filters card skeleton
 * - Results count skeleton
 * - News listing cards skeleton (5 cards in single-column grid)
 */
export default function NewsListLoading() {
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
          <div className="flex items-center gap-4 flex-wrap">
            <Skeleton className="h-9 w-full md:max-w-96 rounded-md" />
            <Skeleton className="h-9 w-45 rounded-md" />
            <Skeleton className="h-9 w-45 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </Card>

      {/* Results Count Skeleton */}
      <Skeleton className="h-5 w-48" />

      {/* News Listing Cards Skeleton */}
      <section className="grid gap-4">
        <NewsListSkeleton count={5} />
      </section>
    </div>
  );
}
