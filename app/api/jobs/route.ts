import { type Prisma } from "@prisma/client";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { findPublishedJobsApiPaginated } from "@/lib/db/repositories/jobs";
import { apiError, apiErrorFromUnknown } from "@/lib/http/api-response";
import {
  mapPublicPagination,
  mapPublicPaginationMeta,
} from "@/lib/http/public-pagination";
import { publishedJobsListWhere } from "@/lib/public-content/published-filters";
import {
  type JobsQueryParams,
  ValidationError,
  parseJobsQueryParams,
} from "@/lib/validation/schemas";

function normalizeStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function getLocalizedPrefectureName(
  prefecture: {
    nameVN: string;
    nameJP: string | null;
    code: string;
  },
  locale: JobsQueryParams["locale"],
): string {
  if (locale === "ja") {
    return prefecture.nameJP ?? prefecture.nameVN;
  }

  return prefecture.nameVN || prefecture.nameJP || prefecture.code;
}

function getOrderBy(): Prisma.JobPostOrderByWithRelationInput[] {
  return [{ publishAt: "desc" }, { createdAt: "desc" }];
}

export async function GET(request: NextRequest) {
  try {
    const query = parseJobsQueryParams(request.nextUrl.searchParams);
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
    const [total, jobs] = await findPublishedJobsApiPaginated({
      where: whereClause,
      orderBy: getOrderBy(),
      skip: pagination.skip,
      take: pagination.take,
    });

    const items = jobs.map((job) => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      salaryText: job.salaryText,
      benefits: normalizeStringArray(job.benefits),
      descriptionRich: job.descriptionRich as Record<string, unknown>,
      status: "PUBLISHED" as const,
      publishAt: job.publishAt?.toISOString() ?? null,
      prefecture: {
        id: job.prefecture.id,
        code: job.prefecture.code,
        nameVN: job.prefecture.nameVN,
        nameJP: job.prefecture.nameJP,
        name: getLocalizedPrefectureName(job.prefecture, query.locale),
      },
      heroImage: job.heroImage
        ? {
            id: job.heroImage.id,
            url: job.heroImage.url,
            width: job.heroImage.width,
            height: job.heroImage.height,
            altText: job.heroImage.altText,
          }
        : null,
    }));

    const meta = mapPublicPaginationMeta({
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
    });

    return NextResponse.json({ items, meta }, { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return apiError(400, "BAD_REQUEST", error.message, {
        field: error.field,
      });
    }

    return apiErrorFromUnknown(error);
  }
}
