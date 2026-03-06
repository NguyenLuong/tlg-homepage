import { ImageResponse } from "next/og";

import { findPublishedNewsForOgImage } from "@/lib/db/repositories/news";
import {
  localizePublicPath,
  parsePublicLocale,
  type PublicLocale,
} from "@/lib/i18n/public-locales";

export const runtime = "nodejs";
export const alt = "TLG News";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type NewsOpenGraphImageProps = {
  params: Promise<{ slug: string; locale?: string }>;
};

type NewsOpenGraphRecord = {
  title: string;
  contentRich: unknown;
  publishAt: Date | null;
  category: {
    nameVN: string;
  };
};

const NEWS_OPEN_GRAPH_COPY: Record<PublicLocale, { latestUpdate: string }> = {
  vi: {
    latestUpdate: "Vua dang",
  },
  ja: {
    latestUpdate: "Just now",
  },
};

function truncateText(value: string | null, maxLength: number): string {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}...`;
}

async function getNewsForOpenGraph(
  slug: string,
): Promise<NewsOpenGraphRecord | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  return findPublishedNewsForOgImage(normalizedSlug);
}

function formatPublishAt(value: Date | null, locale: PublicLocale): string {
  if (!value) {
    return NEWS_OPEN_GRAPH_COPY[locale].latestUpdate;
  }

  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "vi-VN", {
    dateStyle: "medium",
  }).format(value);
}

export default async function NewsOpenGraphImage({
  params,
}: NewsOpenGraphImageProps) {
  const { slug, locale: localeParam } = await params;
  const locale = parsePublicLocale(localeParam);
  const news = await getNewsForOpenGraph(slug);

  if (!news) {
    return new Response("Not Found", { status: 404 });
  }

  const title = truncateText(news.title, 110);
  const rawHtml =
    typeof (news.contentRich as Record<string, unknown>)?.html === "string"
      ? ((news.contentRich as Record<string, unknown>).html as string)
      : "";
  const plainText = rawHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const description = truncateText(plainText, 180);
  const published = formatPublishAt(news.publishAt, locale);
  const canonicalPath = localizePublicPath(`/news/${slug}`, locale);

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
            gap: 16,
            maxWidth: 930,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              borderRadius: 9999,
              border: "1px solid rgba(148, 163, 184, 0.8)",
              padding: "6px 14px",
              fontSize: 22,
              color: "#cbd5e1",
            }}
          >
            {news.category.nameVN}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 62,
              lineHeight: 1.1,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              color: "#e2e8f0",
            }}
          >
            {description}
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
