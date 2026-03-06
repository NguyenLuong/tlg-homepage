import type { Metadata } from "next";
import Image from "next/image";

import { PublicBackLink } from "@/components/public/public-back-link";
import { PublicDetailUnavailable } from "@/components/public/public-detail-unavailable";
import { Badge } from "@/components/ui/badge";
import { canAccessPreview } from "@/lib/auth/preview";
import { parsePublicLocale } from "@/lib/i18n/public-locales";
import { getBlurDataURL } from "@/lib/media/image-service";
import { JOB_DETAIL_COPY } from "@/lib/public-content/job-detail-content";
import { resolveLocalizedContentBlock } from "@/lib/public-content/localized-blocks";
import {
  buildPublicCanonicalPath,
  buildPublicMetadataDescription,
  buildPublicMetadataTitle,
} from "@/lib/seo/public-metadata";
import {
  buildBackToJobsHref,
  extractJobDescriptionHtml,
  formatDateTime,
  getJobDetailBySlug,
  htmlToPlainText,
  sanitizeDescriptionHtml,
  toContentParagraphs,
  toLocalizedBlockMap,
} from "@/app/(public)/[locale]/jobs/[slug]/utils";
import { formatCurrencyNumber } from "@/lib/utils";

type JobDetailPageProps = {
  params: Promise<{ slug: string; locale?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: JobDetailPageProps): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const locale = parsePublicLocale(localeParam);
  const copy = JOB_DETAIL_COPY[locale];
  const resolvedSearchParams = await searchParams;
  const previewEnabled = canAccessPreview(resolvedSearchParams);
  const job = await getJobDetailBySlug(slug, resolvedSearchParams);

  if (!job) {
    return {
      title: buildPublicMetadataTitle({
        locale,
        title: copy.jobNotFound,
        siteName: copy.metadataSiteName,
      }),
      description: buildPublicMetadataDescription({
        locale,
        description: copy.jobNotFoundDescription,
      }),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const localizedDescriptionBlocks = toLocalizedBlockMap(job.descriptionRich);
  const descriptionRichForMetadata = localizedDescriptionBlocks
    ? resolveLocalizedContentBlock<unknown>(
        localizedDescriptionBlocks,
        locale,
        {
          blockName: copy.description,
          isMissing: (block) => toContentParagraphs(block).length === 0,
        },
      ).block
    : job.descriptionRich;
  const descriptionHtml = extractJobDescriptionHtml(descriptionRichForMetadata);
  const descriptionPlainText = htmlToPlainText(descriptionHtml);
  const fallbackSummary = job.salaryText;
  const description = descriptionPlainText || fallbackSummary;
  const canonicalPath = buildPublicCanonicalPath({
    locale,
    pathname: `/jobs/${job.slug}`,
  });
  const title = buildPublicMetadataTitle({
    locale,
    title: job.title,
    siteName: copy.metadataSiteName,
  });

  return {
    title,
    description: buildPublicMetadataDescription({
      locale,
      description,
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
      publishedTime: job.publishAt?.toISOString(),
      modifiedTime: job.updatedAt.toISOString(),
      images: job.heroImage
        ? [
            {
              url: job.heroImage.url,
              alt: job.heroImage.altText || job.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function JobDetailPage({
  params,
  searchParams,
}: JobDetailPageProps) {
  const { slug, locale: localeParam } = await params;
  const locale = parsePublicLocale(localeParam);
  const copy = JOB_DETAIL_COPY[locale];
  const resolvedSearchParams = await searchParams;
  const previewEnabled = canAccessPreview(resolvedSearchParams);
  const job = await getJobDetailBySlug(slug, resolvedSearchParams);
  const backToJobsHref = buildBackToJobsHref(locale, resolvedSearchParams);

  if (!job) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <PublicDetailUnavailable
          title={copy.jobNotFound}
          description={copy.jobNotFoundDescription}
          backHref={backToJobsHref}
          backLabel={copy.backToJobs}
        />
      </main>
    );
  }

  const descriptionBlockMap = toLocalizedBlockMap(job.descriptionRich);

  const descriptionResolution = descriptionBlockMap
    ? resolveLocalizedContentBlock<unknown>(descriptionBlockMap, locale, {
        blockName: copy.description,
        isMissing: (block) => !extractJobDescriptionHtml(block).trim(),
      })
    : null;

  const fallbackNotice = descriptionResolution?.fallbackNotice || null;
  const resolvedDescriptionHtml = sanitizeDescriptionHtml(
    extractJobDescriptionHtml(
      descriptionResolution?.block ?? job.descriptionRich,
    ),
  );

  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-4">
        {previewEnabled ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {copy.previewNotice}
          </p>
        ) : null}
        {fallbackNotice ? (
          <p
            role="status"
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          >
            {fallbackNotice}
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Badge variant="secondary">
          {locale === "ja"
            ? (job.prefecture.nameJP ?? job.prefecture.nameVN)
            : job.prefecture.nameVN}
        </Badge>
        <span>|</span>
        <span>
          {copy.publishedAt} {formatDateTime(job.publishAt, locale)}
        </span>
      </div>

      <header className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {job.title}
        </h1>
        <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-900">{copy.salary}</dt>
            <dd>
              {formatCurrencyNumber(job.salaryText)} {copy.currency}
            </dd>
          </div>
          {Array.isArray(job.benefits) && job.benefits.length > 0 ? (
            <div>
              <dt className="font-medium text-slate-900">{copy.benefits}</dt>
              <dd>
                <ul className="mt-1 space-y-0.5">
                  {(job.benefits as string[]).map((benefit, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-slate-400">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      {job.heroImage ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <Image
            src={job.heroImage.url}
            alt={job.heroImage.altText || job.title}
            width={job.heroImage.width}
            height={job.heroImage.height}
            className="h-auto w-full object-cover"
            priority
            placeholder="blur"
            blurDataURL={getBlurDataURL(job.heroImage.url)}
          />
        </div>
      ) : null}

      <section className="space-y-4 text-base leading-7 text-slate-800">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {copy.description}
        </h2>
        {!resolvedDescriptionHtml.trim() ? (
          <p>{copy.emptyDescription}</p>
        ) : (
          <div
            className="max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2.5 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-0.5 [&_strong]:font-bold [&_em]:italic [&_a]:text-blue-600 [&_a]:no-underline"
            dangerouslySetInnerHTML={{ __html: resolvedDescriptionHtml }}
          />
        )}
      </section>

      <footer className="pt-2">
        <PublicBackLink href={backToJobsHref} label={copy.backToJobs} />
      </footer>
    </article>
  );
}
