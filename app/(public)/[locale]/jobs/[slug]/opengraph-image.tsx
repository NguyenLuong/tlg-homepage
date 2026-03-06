import { ImageResponse } from "next/og";

import { findPublishedJobForOgImage } from "@/lib/db/repositories/jobs";
import {
  localizePublicPath,
  parsePublicLocale,
  type PublicLocale,
} from "@/lib/i18n/public-locales";

export const runtime = "nodejs";
export const alt = "TLG Jobs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type JobOpenGraphImageProps = {
  params: Promise<{ slug: string; locale?: string }>;
};

type JobOpenGraphRecord = {
  title: string;
  salaryText: string;
  publishAt: Date | null;
  prefecture: {
    nameJP: string | null;
    nameVN: string;
  };
  heroImage: {
    url: string;
    altText: string | null;
  } | null;
};

function truncateText(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}...`;
}

function formatPublishAt(value: Date | null, locale: PublicLocale): string {
  if (!value) {
    return locale === "ja" ? "Saishin kyujin" : "Tin tuyen dung moi";
  }

  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "vi-VN", {
    dateStyle: "medium",
  }).format(value);
}

async function getJobForOpenGraph(
  slug: string,
): Promise<JobOpenGraphRecord | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  return findPublishedJobForOgImage(normalizedSlug);
}

export default async function JobOpenGraphImage({
  params,
}: JobOpenGraphImageProps) {
  const { slug, locale: localeParam } = await params;
  const locale = parsePublicLocale(localeParam);
  const job = await getJobForOpenGraph(slug);

  if (!job) {
    return new Response("Not Found", { status: 404 });
  }

  const title = truncateText(job.title, 105);
  const location =
    locale === "ja"
      ? (job.prefecture.nameJP ?? job.prefecture.nameVN)
      : job.prefecture.nameVN;
  const salary = truncateText(job.salaryText, 80);
  const published = formatPublishAt(job.publishAt, locale);
  const canonicalPath = localizePublicPath(`/jobs/${slug}`, locale);

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
        color: "#f8fafc",
        overflow: "hidden",
      }}
    >
      {job.heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- `next/og` requires native image elements.
        <img
          src={job.heroImage.url}
          alt={job.heroImage.altText || title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.25,
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(15, 23, 42, 0.93) 0%, rgba(15, 23, 42, 0.75) 55%, rgba(15, 23, 42, 0.5) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "56px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 0.4,
          }}
        >
          TLG
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxWidth: 940,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              alignSelf: "flex-start",
            }}
          >
            <span
              style={{
                fontSize: 22,
                color: "#cbd5e1",
              }}
            >
              {location}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 60,
              lineHeight: 1.1,
              fontWeight: 700,
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              fontSize: 30,
              color: "#e2e8f0",
            }}
          >
            <span>{salary}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#cbd5e1",
          }}
        >
          <span>{published}</span>
          <span>{canonicalPath}</span>
        </div>
      </div>
    </div>,
    size,
  );
}
