
import sanitizeHtml from "sanitize-html";

import { JobStatus } from "@prisma/client";

import {
  canAccessPreview,
  isPreviewRequested,
  type PreviewSearchParams,
} from "@/lib/auth/preview";
import { findPublishedJobDetail } from "@/lib/db/repositories/jobs";
import {
  localizePublicPath,
  type PublicLocale
} from "@/lib/i18n/public-locales";
import { JOB_DETAIL_COPY } from "@/lib/public-content/job-detail-content";
import { publishedJobsDetailWhere } from "@/lib/public-content/published-filters";
import {
  ValidationError,
  parseJobsQueryParams,
} from "@/lib/validation/schemas";
import { JobDetailRecord } from "@/app/(public)/[locale]/jobs/[slug]/types";

export function formatDateTime(value: Date | null, locale: PublicLocale): string {
  if (!value) {
    return JOB_DETAIL_COPY[locale].notSpecified;
  }

  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function flattenTextValues(
  value: unknown,
  output: string[] = [],
  depth = 0,
): string[] {
  if (depth > 6 || value === null || value === undefined) {
    return output;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) {
      output.push(trimmed);
    }
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      flattenTextValues(item, output, depth + 1);
    }
    return output;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const [key, item] of Object.entries(obj)) {
      if (
        key === "id" ||
        key === "slug" ||
        key === "url" ||
        key === "href" ||
        key === "type"
      ) {
        continue;
      }

      flattenTextValues(item, output, depth + 1);
    }
  }

  return output;
}

export function toContentParagraphs(value: unknown): string[] {
  const rawChunks = flattenTextValues(value);
  const paragraphs: string[] = [];
  const seen = new Set<string>();

  for (const chunk of rawChunks) {
    for (const part of chunk.split(/\r?\n+/)) {
      const text = part.trim();
      if (!text || seen.has(text)) {
        continue;
      }

      seen.add(text);
      paragraphs.push(text);
    }
  }

  return paragraphs;
}

export function extractJobDescriptionHtml(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const record = value as Record<string, unknown>;

  if (typeof record.html === "string") {
    return record.html;
  }

  if (record.localized && typeof record.localized === "object") {
    const localized = record.localized as Record<string, unknown>;
    for (const key of ["vi", "ja"]) {
      const block = localized[key];
      if (!block || typeof block !== "object" || Array.isArray(block)) {
        continue;
      }

      const html = (block as Record<string, unknown>).html;
      if (typeof html === "string") {
        return html;
      }
    }
  }

  return "";
}

export function sanitizeDescriptionHtml(rawHtml: string): string {
  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "code",
      "pre",
      "hr",
      "div",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const nextAttribs = {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        };

        return {
          tagName,
          attribs: nextAttribs,
        };
      },
    },
  });
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toLocalizedBlockMap(
  value: unknown,
): Partial<Record<PublicLocale, unknown>> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const directHasLocaleKeys =
    Object.prototype.hasOwnProperty.call(candidate, "vi") ||
    Object.prototype.hasOwnProperty.call(candidate, "ja");

  if (directHasLocaleKeys) {
    return {
      vi: candidate.vi ?? undefined,
      ja: candidate.ja ?? undefined,
    };
  }

  const nestedLocalized = candidate.localized;
  if (
    !nestedLocalized ||
    typeof nestedLocalized !== "object" ||
    Array.isArray(nestedLocalized)
  ) {
    return null;
  }

  const nested = nestedLocalized as Record<string, unknown>;
  const nestedHasLocaleKeys =
    Object.prototype.hasOwnProperty.call(nested, "vi") ||
    Object.prototype.hasOwnProperty.call(nested, "ja");

  if (!nestedHasLocaleKeys) {
    return null;
  }

  return {
    vi: nested.vi ?? undefined,
    ja: nested.ja ?? undefined,
  };
}

export function getFirstQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function buildBackToJobsHref(
  locale: PublicLocale,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const jobsBasePath = localizePublicPath("/jobs", locale);
  const hasListContext = ["page", "pageSize", "prefecture"].some(
    (key) => getFirstQueryValue(searchParams[key]) !== undefined,
  );

  if (!hasListContext) {
    return jobsBasePath;
  }

  try {
    const query = parseJobsQueryParams({
      locale,
      page: getFirstQueryValue(searchParams.page),
      pageSize: getFirstQueryValue(searchParams.pageSize),
      prefecture: getFirstQueryValue(searchParams.prefecture),
    });

    const params = new URLSearchParams({
      page: String(query.page),
      pageSize: String(query.pageSize),
    });

    if (query.prefecture) {
      params.set("prefecture", query.prefecture);
    }

    return `${jobsBasePath}?${params.toString()}`;
  } catch (error) {
    if (error instanceof ValidationError) {
      return jobsBasePath;
    }

    throw error;
  }
}

export async  function getJobDetailBySlug(
  slug: string,
  previewSearchParams: PreviewSearchParams,
): Promise<JobDetailRecord | null> {
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
          in: [JobStatus.DRAFT, JobStatus.SCHEDULED, JobStatus.PUBLISHED],
        },
      }
    : publishedJobsDetailWhere(normalizedSlug, now);

  return findPublishedJobDetail(where);
}
