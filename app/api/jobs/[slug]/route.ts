import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { findPublishedJobApiDetail } from "@/lib/db/repositories/jobs";
import { apiError, apiErrorFromUnknown } from "@/lib/http/api-response";
import { getLocaleFromRequest } from "@/lib/http/error-messages";
import { ValidationError } from "@/lib/validation/schemas";

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
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

    const item = await findPublishedJobApiDetail(parsedSlug);

    if (!item) {
      return apiError(
        404,
        "NOT_FOUND",
        "Job post was not found.",
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
          salaryText: item.salaryText,
          benefits: normalizeStringArray(item.benefits),
          descriptionRich: item.descriptionRich as Record<string, unknown>,
          status: "PUBLISHED" as const,
          publishAt: item.publishAt?.toISOString() ?? null,
          updatedAt: item.updatedAt.toISOString(),
          prefecture: {
            id: item.prefecture.id,
            code: item.prefecture.code,
            nameVN: item.prefecture.nameVN,
            nameJP: item.prefecture.nameJP,
          },
          heroImage: item.heroImage
            ? {
                id: item.heroImage.id,
                url: item.heroImage.url,
                width: item.heroImage.width,
                height: item.heroImage.height,
                altText: item.heroImage.altText,
              }
            : null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return apiErrorFromUnknown(error, locale);
  }
}
