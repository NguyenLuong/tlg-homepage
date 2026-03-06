import type { Metadata } from "next";

import { NewsStatus } from "@prisma/client";

import { NewsDetailArticle } from "@/components/public/news-detail-article";
import { PublicDetailUnavailable } from "@/components/public/public-detail-unavailable";
import {
  canAccessPreview,
  isPreviewRequested,
  type PreviewSearchParams,
} from "@/lib/auth/preview";
import { findPublishedNewsDetail } from "@/lib/db/repositories/news";
import {
  localizePublicPath,
  parsePublicLocale,
  type PublicLocale,
} from "@/lib/i18n/public-locales";
import { NEWS_DETAIL_COPY } from "@/lib/public-content/news-detail-content";
import {
  buildPublicCanonicalPath,
  buildPublicMetadataDescription,
  buildPublicMetadataTitle,
} from "@/lib/seo/public-metadata";

type NewsDetailPageProps = {
  params: Promise<{ slug: string; locale?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type NewsDetailRecord = {
  id: string;
  title: string;
  slug: string;
  contentRich: unknown;
  publishAt: Date | null;
  updatedAt: Date;
  category: {
    nameVN: string;
    nameJA: string | null;
    slug: string;
  };
};

function formatNewsDate(value: Date | null, locale: PublicLocale): string {
  if (!value) {
    return NEWS_DETAIL_COPY[locale].justNow;
  }

  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

async function getNewsDetailBySlug(
  slug: string,
  previewSearchParams: PreviewSearchParams,
): Promise<NewsDetailRecord | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const previewRequested = isPreviewRequested(previewSearchParams);
  const previewAllowed = canAccessPreview(previewSearchParams);

  if (previewRequested && !previewAllowed) {
    return null;
  }

  const now = new Date();

  const where = previewAllowed
    ? {
        slug: normalizedSlug,
        status: {
          in: [NewsStatus.DRAFT, NewsStatus.SCHEDULED, NewsStatus.PUBLISHED],
        },
      }
    : {
        slug: normalizedSlug,
        status: NewsStatus.PUBLISHED,
        OR: [{ publishAt: null }, { publishAt: { lte: now } }],
      };

  return findPublishedNewsDetail(where);
}

export async function generateMetadata({
  params,
  searchParams,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = parsePublicLocale(localeParam);
  const copy = NEWS_DETAIL_COPY[locale];
  const resolvedSearchParams = await searchParams;
  const previewEnabled = canAccessPreview(resolvedSearchParams);
  const news = await getNewsDetailBySlug(slug, resolvedSearchParams);

  if (!news) {
    return {
      title: buildPublicMetadataTitle({
        locale,
        title: copy.newsNotFound,
        siteName: copy.metadataSiteName,
      }),
      description: buildPublicMetadataDescription({
        locale,
        description: copy.newsNotFoundDescription,
      }),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const contentHtml =
    typeof (news.contentRich as Record<string, unknown>)?.html === "string"
      ? ((news.contentRich as Record<string, unknown>).html as string)
      : "";
  const description = contentHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  const canonicalPath = buildPublicCanonicalPath({
    locale,
    pathname: `/news/${news.slug}`,
  });
  const title = buildPublicMetadataTitle({
    locale,
    title: news.title,
    siteName: copy.metadataSiteName,
  });

  return {
    title,
    description: buildPublicMetadataDescription({
      locale,
      description: description ?? copy.metadataDefaultDescription,
      defaultDescription: copy.metadataDefaultDescription,
    }),
    alternates: {
      canonical: canonicalPath,
    },
    robots: previewEnabled
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalPath,
      publishedTime: news.publishAt?.toISOString(),
      modifiedTime: news.updatedAt.toISOString(),
    },
  };
}

export default async function NewsDetailPage({
  params,
  searchParams,
}: NewsDetailPageProps) {
  const { slug, locale: localeParam } = await params;
  const locale = parsePublicLocale(localeParam);
  const copy = NEWS_DETAIL_COPY[locale];
  const resolvedSearchParams = await searchParams;
  const previewEnabled = canAccessPreview(resolvedSearchParams);
  const news = await getNewsDetailBySlug(slug, resolvedSearchParams);
  const backToNewsHref = localizePublicPath("/news", locale);

  if (!news) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <PublicDetailUnavailable
          title={copy.newsNotFound}
          description={copy.newsNotFoundDescription}
          backHref={backToNewsHref}
          backLabel={copy.backToNews}
        />
      </main>
    );
  }

  const contentHtml =
    typeof (news.contentRich as Record<string, unknown>)?.html === "string"
      ? ((news.contentRich as Record<string, unknown>).html as string)
      : "";

  return (
    <main className="space-y-6">
      {previewEnabled ? (
        <p className="mx-auto w-full max-w-3xl rounded-lg border border-amber-300 bg-amber-50 px-6 py-2 text-sm text-amber-900">
          {copy.previewNotice}
        </p>
      ) : null}

      <NewsDetailArticle
        title={news.title}
        categoryName={
          locale === "ja"
            ? (news.category.nameJA ?? news.category.nameVN)
            : news.category.nameVN
        }
        publishContext={formatNewsDate(news.publishAt, locale)}
        contentHtml={contentHtml}
        backHref={backToNewsHref}
        copy={{
          noDetails: copy.noDetails,
          backToNews: copy.backToNews,
        }}
      />
    </main>
  );
}
