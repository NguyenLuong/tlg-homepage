import Link from "next/link";

import { NewsStatus, type Prisma } from "@prisma/client";

import { NewsFilterBar } from "@/components/public/news-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findPublishedNewsPaginated } from "@/lib/db/repositories/news";
import { findPublicNewsCategories } from "@/lib/db/repositories/lookups";
import {
  mapPublicPagination,
  mapPublicPaginationMeta,
} from "@/lib/http/public-pagination";
import {
  localizePublicPath,
  parsePublicLocale,
  type PublicLocale,
} from "@/lib/i18n/public-locales";
import { NEWS_PAGE_COPY } from "@/lib/public-content/news-list-content";
import {
  ValidationError,
  parseNewsQueryParams,
} from "@/lib/validation/schemas";

type NewsSearchParams = Record<string, string | string[] | undefined>;

type NewsPageProps = {
  params: Promise<{
    locale?: string;
  }>;
  searchParams: Promise<NewsSearchParams>;
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
    return NEWS_PAGE_COPY[locale].justNowLabel;
  }

  const localeCode = locale === "ja" ? "ja-JP" : "vi-VN";
  return new Intl.DateTimeFormat(localeCode, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function buildNewsHref(
  locale: PublicLocale,
  query: ReturnType<typeof parseNewsQueryParams>,
  page: number,
): string {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("pageSize", String(query.pageSize));

  if (query.category) {
    params.set("category", query.category);
  }
  if (query.q) {
    params.set("q", query.q);
  }

  return `${localizePublicPath("/news", locale)}?${params.toString()}`;
}

function shouldShowReset(
  query: ReturnType<typeof parseNewsQueryParams>,
): boolean {
  return Boolean(
    query.category || query.q || query.page !== 1 || query.pageSize !== 10,
  );
}

export default async function NewsListPage({
  params,
  searchParams,
}: NewsPageProps) {
  const routeParams = await params;
  const rawSearchParams = await searchParams;
  const routeLocale = parsePublicLocale(routeParams.locale);

  let query: ReturnType<typeof parseNewsQueryParams>;
  try {
    query = parseNewsQueryParams({
      page: getFirstQueryValue(rawSearchParams.page),
      pageSize: getFirstQueryValue(rawSearchParams.pageSize),
      locale: routeLocale,
      category: getFirstQueryValue(rawSearchParams.category),
      q: getFirstQueryValue(rawSearchParams.q),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      query = parseNewsQueryParams({ locale: routeLocale });
    } else {
      throw error;
    }
  }

  const pagination = mapPublicPagination({
    page: query.page,
    pageSize: query.pageSize,
  });

  const filters: Prisma.NewsPostWhereInput[] = [
    { status: NewsStatus.PUBLISHED },
    {
      OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
    },
  ];

  if (query.category) {
    filters.push({
      category: {
        slug: query.category.toLowerCase(),
      },
    });
  }

  if (query.q) {
    filters.push({
      title: { contains: query.q, mode: "insensitive" },
    });
  }

  const whereClause = { AND: filters };
  const [newsResult, categories] = await Promise.all([
    findPublishedNewsPaginated({
      where: whereClause,
      orderBy: [{ publishAt: "desc" }, { createdAt: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
    }),
    findPublicNewsCategories(),
  ]);

  const [total, newsItems] = newsResult;
  const meta = mapPublicPaginationMeta({
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
  });

  const copy = NEWS_PAGE_COPY[query.locale];
  const newsBasePath = localizePublicPath("/news", query.locale);
  const pageStart = meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const pageEnd = Math.min(meta.page * meta.pageSize, meta.total);
  const previousPageHref =
    meta.page > 1 ? buildNewsHref(query.locale, query, meta.page - 1) : null;
  const nextPageHref =
    meta.pageCount > 0 && meta.page < meta.pageCount
      ? buildNewsHref(query.locale, query, meta.page + 1)
      : null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {copy.title}
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">{copy.subtitle}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{copy.filtersTitle}</CardTitle>
          <CardDescription>{copy.filtersDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsFilterBar
            basePath={newsBasePath}
            locale={query.locale}
            categories={categories}
            defaults={{
              q: query.q ?? "",
              category: query.category ?? "",
              pageSize: String(query.pageSize),
            }}
            copy={{
              searchPlaceholder: copy.searchPlaceholder,
              searchAriaLabel: copy.searchAriaLabel,
              categoryAriaLabel: copy.categoryAriaLabel,
              allCategories: copy.allCategories,
              pageSizeAriaLabel: copy.pageSizeAriaLabel,
              perPageLabels: copy.perPageLabels,
              applyLabel: copy.applyLabel,
              resetLabel: copy.resetLabel,
            }}
            showReset={shouldShowReset(query)}
          />
        </CardContent>
      </Card>

      <p className="text-sm text-slate-600">
        {copy.showingLabel(pageStart, pageEnd, meta.total)}
      </p>

      {newsItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-600">
            {copy.noResults}
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4">
          {newsItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {query.locale === "ja"
                      ? (item.category.nameJA ?? item.category.nameVN)
                      : item.category.nameVN}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatPublishDate(item.publishAt, query.locale)}
                  </span>
                </div>
                <CardTitle>
                  <Link
                    href={localizePublicPath(
                      `/news/${item.slug}`,
                      query.locale,
                    )}
                    className="transition-colors hover:text-slate-600"
                  >
                    {item.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={localizePublicPath(
                      `/news/${item.slug}`,
                      query.locale,
                    )}
                  >
                    {copy.readMoreLabel}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      )}

      {meta.pageCount > 1 ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label={copy.paginationLabel}
        >
          <Button asChild variant="outline" disabled={!previousPageHref}>
            <Link
              href={previousPageHref ?? "#"}
              aria-disabled={!previousPageHref}
            >
              {copy.previousLabel}
            </Link>
          </Button>
          <p className="text-sm text-slate-600">
            {copy.pageLabel(meta.page, meta.pageCount)}
          </p>
          <Button asChild variant="outline" disabled={!nextPageHref}>
            <Link href={nextPageHref ?? "#"} aria-disabled={!nextPageHref}>
              {copy.nextLabel}
            </Link>
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
