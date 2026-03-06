import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { findPublishedNewsApiDetail } from "@/lib/db/repositories/news";
import { apiError, apiErrorFromUnknown } from "@/lib/http/api-response";
import { getLocaleFromRequest } from "@/lib/http/error-messages";
import { ValidationError } from "@/lib/validation/schemas";

function toContentRichObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function parseSlug(value: unknown): string {
  if (typeof value !== "string") {
    throw new ValidationError("slug", "must be a string");
  }

  const slug = value.trim().toLowerCase();
  if (!slug) {
    throw new ValidationError("slug", "is required");
  }

  return slug;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const locale = getLocaleFromRequest(request);

  try {
    const { slug } = await params;
    const parsedSlug = parseSlug(slug);
    const item = await findPublishedNewsApiDetail(parsedSlug);

    if (!item) {
      return apiError(
        404,
        "NOT_FOUND",
        "News post was not found.",
        undefined,
        undefined,
        locale,
      );
    }

    return NextResponse.json(
      {
        item: {
          id: item.id,
          slug: item.slug,
          title: item.title,
          contentRich: toContentRichObject(item.contentRich),
          status: "PUBLISHED" as const,
          publishAt: item.publishAt?.toISOString() ?? null,
          category: {
            id: item.category.id,
            name: item.category.nameVN,
            slug: item.category.slug,
            iconKey: item.category.iconKey,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return apiErrorFromUnknown(error, locale);
  }
}
