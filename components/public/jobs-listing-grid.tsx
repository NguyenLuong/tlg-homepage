import Link from "next/link";
import Image from "next/image";

import { ArrowRight, HandCoins, JapaneseYen, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getBlurDataURL } from "@/lib/media/image-service";
import { formatCurrencyNumber } from "@/lib/utils";

export type JobsListingGridItem = {
  id: string;
  title: string;
  salaryText: string;
  benefitsSummary?: string | null;
  publishContext?: string;
  prefectureName: string;
  detailHref: string;
  heroImage?: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
};

export type JobsListingGridCopy = {
  salaryLabel: string;
  benefitsLabel: string;
  detailCta: string;
  emptyTitle: string;
  emptyDescription: string;
  resetFiltersCta?: string;
  backToHomepageCta: string;
  currency: string;
};

export type FillerSlot = {
  title: string;
  description: string;
};

type JobsListingGridProps = {
  jobs: JobsListingGridItem[];
  copy: JobsListingGridCopy;
  /** Whether filters are currently active (determines if reset button should show) */
  hasActiveFilters?: boolean;
  /** URL to reset filters (if hasActiveFilters is true) */
  resetFiltersHref?: string;
  /** URL to homepage */
  homepageHref: string;
  /** Placeholder cards to fill empty grid slots (e.g. homepage 3-slot layout) */
  fillerSlots?: FillerSlot[];
};

export function JobsListingGrid({
  jobs,
  copy,
  hasActiveFilters = false,
  resetFiltersHref,
  homepageHref,
  fillerSlots,
}: JobsListingGridProps) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon="💼"
        title={copy.emptyTitle}
        description={copy.emptyDescription}
        action={
          hasActiveFilters && resetFiltersHref
            ? {
                label: copy.resetFiltersCta || "Reset filters",
                href: resetFiltersHref,
              }
            : {
                label: copy.backToHomepageCta,
                href: homepageHref,
              }
        }
      />
    );
  }

  return (
    <section
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      aria-label="Published jobs"
    >
      {jobs.map((job) => (
        <article
          key={job.id}
          className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-[0_20px_50px_-35px_rgba(0,0,0,0.35)]"
        >
          {/* Hero Image */}
          <div className="relative aspect-video w-full bg-slate-100">
            {job.heroImage ? (
              <Image
                src={job.heroImage.url}
                alt={job.heroImage.altText || job.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL={getBlurDataURL(job.heroImage.url)}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-linear-to-br from-cyan-100 to-sky-200">
                <div className="text-4xl text-slate-400">💼</div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Badge variant="secondary">
                <MapPin className="size-2" />
                {job.prefectureName}
              </Badge>
              {job.publishContext ? <span>{job.publishContext}</span> : null}
            </div>

            <h3 className="mt-2 text-lg font-bold text-slate-900">
              <Link
                href={job.detailHref}
                className="transition-colors hover:text-slate-600"
              >
                {job.title}
              </Link>
            </h3>

            <p className="mt-2 flex items-center gap-0.5 text-sm font-semibold text-cyan-700">
              <JapaneseYen size={18} /> {copy.salaryLabel}:{" "}
              {formatCurrencyNumber(job.salaryText)} {copy.currency}
            </p>

            {job.benefitsSummary ? (
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                <HandCoins size={16} /> {copy.benefitsLabel}:{" "}
                {job.benefitsSummary}
              </div>
            ) : null}

            <Link
              href={job.detailHref}
              className="mt-5 inline-flex items-center text-sm font-semibold text-cyan-700 hover:text-cyan-800"
            >
              {copy.detailCta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </article>
      ))}

      {fillerSlots?.map((slot, index) => (
        <article
          key={`filler-${index}`}
          className="rounded-2xl border border-dashed border-cyan-100 bg-cyan-50/40 p-5 text-sm text-slate-500"
          aria-hidden="true"
        >
          <p className="font-semibold text-slate-600">{slot.title}</p>
          <p className="mt-2">{slot.description}</p>
        </article>
      ))}
    </section>
  );
}
