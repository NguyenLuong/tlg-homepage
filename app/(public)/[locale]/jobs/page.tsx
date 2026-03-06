import Link from "next/link";

import { type Prisma } from "@prisma/client";

import { JobsFilterBar } from "@/components/public/jobs-filter-bar";
import { JobsListingGrid } from "@/components/public/jobs-listing-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findPublishedJobsPaginated } from "@/lib/db/repositories/jobs";
import { findPublicPrefectures } from "@/lib/db/repositories/lookups";
import {
  mapPublicPagination,
  mapPublicPaginationMeta,
} from "@/lib/http/public-pagination";
import {
  localizePublicPath,
  parsePublicLocale,
  type PublicLocale,
} from "@/lib/i18n/public-locales";
import { JOBS_LIST_CONTENT } from "@/lib/public-content/jobs-list-content";
import { publishedJobsListWhere } from "@/lib/public-content/published-filters";
import {
  ValidationError,
  parseJobsQueryParams,
} from "@/lib/validation/schemas";

type JobsSearchParams = Record<string, string | string[] | undefined>;

type JobsPageProps = {
  params: Promise<{
    locale?: string;
  }>;
  searchParams: Promise<JobsSearchParams>;
};

function getFirstQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function formatPublishDate(value: Date | null, locale: PublicLocale): string {
  if (!value) {
    return locale === "ja" ? "Just now" : "Vua dang";
  }

  const localeCode = locale === "ja" ? "ja-JP" : "vi-VN";
  return new Intl.DateTimeFormat(localeCode, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getLocalizedPrefectureName(
  prefecture: {
    nameVN: string;
    nameJP: string | null;
    code: string;
  },
  locale: PublicLocale,
): string {
  if (locale === "ja") {
    return prefecture.nameJP ?? prefecture.nameVN;
  }

  return prefecture.nameVN || prefecture.nameJP || prefecture.code;
}

function getOrderBy(): Prisma.JobPostOrderByWithRelationInput[] {
  return [{ publishAt: "desc" }, { createdAt: "desc" }];
}

function collectTextChunks(value: unknown, output: string[] = []): string[] {
  if (value === null || value === undefined) {
    return output;
  }

  if (typeof value === "string") {
    const text = value.trim();
    if (text) {
      output.push(text);
    }
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectTextChunks(item, output);
    }
    return output;
  }

  if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectTextChunks(item, output);
    }
  }

  return output;
}

function getBenefitsSummary(value: unknown, fallback: string): string | null {
  const unique: string[] = [];
  for (const chunk of collectTextChunks(value)) {
    if (unique.includes(chunk)) {
      continue;
    }

    unique.push(chunk);
    if (unique.length === 2) {
      break;
    }
  }

  if (unique.length === 0) {
    return fallback;
  }

  return unique.join(", ");
}

function buildJobsHref(
  locale: PublicLocale,
  query: ReturnType<typeof parseJobsQueryParams>,
  page: number,
): string {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(query.pageSize),
  });

  if (query.prefecture) {
    params.set("prefecture", query.prefecture);
  }

  return `${localizePublicPath("/jobs", locale)}?${params.toString()}`;
}

function buildJobDetailHref(
  locale: PublicLocale,
  slug: string,
  query: ReturnType<typeof parseJobsQueryParams>,
): string {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  });

  if (query.prefecture) {
    params.set("prefecture", query.prefecture);
  }

  return `${localizePublicPath(`/jobs/${slug}`, locale)}?${params.toString()}`;
}

function shouldShowReset(
  query: ReturnType<typeof parseJobsQueryParams>,
): boolean {
  return Boolean(query.prefecture || query.page !== 1 || query.pageSize !== 10);
}

export default async function JobsListPage({
  params,
  searchParams,
}: JobsPageProps) {
  const routeParams = await params;
  const rawSearchParams = await searchParams;
  const routeLocale = parsePublicLocale(routeParams.locale);

  let query: ReturnType<typeof parseJobsQueryParams>;
  try {
    query = parseJobsQueryParams({
      page: getFirstQueryValue(rawSearchParams.page),
      pageSize: getFirstQueryValue(rawSearchParams.pageSize),
      locale: routeLocale,
      prefecture: getFirstQueryValue(rawSearchParams.prefecture),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      query = parseJobsQueryParams({ locale: routeLocale });
    } else {
      throw error;
    }
  }

  const pagination = mapPublicPagination({
    page: query.page,
    pageSize: query.pageSize,
  });

  const filters: Prisma.JobPostWhereInput[] = [];

  if (query.prefecture) {
    filters.push({
      OR: [
        {
          prefecture: {
            code: {
              equals: query.prefecture,
              mode: "insensitive",
            },
          },
        },
        {
          prefecture: {
            nameVN: {
              contains: query.prefecture,
              mode: "insensitive",
            },
          },
        },
        {
          prefecture: {
            nameJP: {
              contains: query.prefecture,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  const whereClause = publishedJobsListWhere(filters);
  const [jobsResult, prefectures] = await Promise.all([
    findPublishedJobsPaginated({
      where: whereClause,
      orderBy: getOrderBy(),
      skip: pagination.skip,
      take: pagination.take,
    }),
    findPublicPrefectures(),
  ]);

  const [total, jobs] = jobsResult;
  const meta = mapPublicPaginationMeta({
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
  });

  const jobsBasePath = localizePublicPath("/jobs", query.locale);
  const pageStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const pageEnd = Math.min(meta.page * meta.pageSize, meta.total);
  const previousPageHref =
    meta.page > 1 ? buildJobsHref(query.locale, query, meta.page - 1) : null;
  const nextPageHref =
    meta.pageCount > 0 && meta.page < meta.pageCount
      ? buildJobsHref(query.locale, query, meta.page + 1)
      : null;
  const content = JOBS_LIST_CONTENT[query.locale];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {content.pageTitle}
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          {content.pageDescription}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{content.filtersTitle}</CardTitle>
          <CardDescription>{content.filtersDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <JobsFilterBar
            basePath={jobsBasePath}
            locale={query.locale}
            prefectures={prefectures}
            defaults={{
              prefecture: query.prefecture ?? "",
              pageSize: String(query.pageSize),
            }}
            copy={{
              prefectureAriaLabel: content.prefectureAriaLabel,
              allPrefectures: content.allPrefectures,
              pageSizeAriaLabel: content.pageSizeAriaLabel,
              pageSize6: content.pageSize6,
              pageSize10: content.pageSize10,
              pageSize20: content.pageSize20,
              pageSize50: content.pageSize50,
              applyCta: content.applyCta,
              resetCta: content.resetCta,
            }}
            showReset={shouldShowReset(query)}
          />
        </CardContent>
      </Card>

      <section className="space-y-2" aria-labelledby="jobs-results-heading">
        <h2
          id="jobs-results-heading"
          className="text-xl font-semibold tracking-tight text-slate-900"
        >
          {content.resultsHeading}
        </h2>
        <p className="text-sm text-slate-600">
          {content.buildResultsSummary(pageStart, pageEnd, meta.total)}
        </p>
      </section>

      <JobsListingGrid
        jobs={jobs.map((job) => ({
          id: job.id,
          title: job.title,
          salaryText: job.salaryText,
          benefitsSummary: getBenefitsSummary(
            job.benefits,
            content.benefitsFallback,
          ),
          publishContext: formatPublishDate(job.publishAt, query.locale),
          prefectureName: getLocalizedPrefectureName(
            job.prefecture,
            query.locale,
          ),
          detailHref: buildJobDetailHref(query.locale, job.slug, query),
          heroImage: job.heroImage,
        }))}
        copy={{
          salaryLabel: content.salaryLabel,
          benefitsLabel: content.benefitsLabel,
          detailCta: content.detailCta,
          emptyTitle: content.emptyTitle,
          emptyDescription: content.emptyDescription,
          resetFiltersCta: content.resetFiltersCta,
          backToHomepageCta: content.backToHomepageCta,
          currency: content.currency,
        }}
        hasActiveFilters={shouldShowReset(query)}
        resetFiltersHref={jobsBasePath}
        homepageHref={localizePublicPath("/", query.locale)}
      />

      {meta.pageCount > 1 ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label={content.paginationAriaLabel}
        >
          {previousPageHref ? (
            <Button asChild variant="outline">
              <Link href={previousPageHref}>{content.previousCta}</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              {content.previousCta}
            </Button>
          )}
          <p className="text-sm text-slate-600">
            {content.buildPaginationSummary(meta.page, meta.pageCount)}
          </p>
          {nextPageHref ? (
            <Button asChild variant="outline">
              <Link href={nextPageHref}>{content.nextCta}</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              {content.nextCta}
            </Button>
          )}
        </nav>
      ) : null}
    </div>
  );
}
