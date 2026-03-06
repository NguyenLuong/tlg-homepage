import { type Prisma } from "@prisma/client";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { findPublishedNewsApiPaginated } from "@/lib/db/repositories/news";
import { apiError, apiErrorFromUnknown } from "@/lib/http/api-response";
import {
  mapPublicPagination,
  mapPublicPaginationMeta,
} from "@/lib/http/public-pagination";
import { publishedNewsListWhere } from "@/lib/public-content/published-filters";
import {
  ValidationError,
  parseNewsQueryParams,
} from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    const query = parseNewsQueryParams(request.nextUrl.searchParams);
    const pagination = mapPublicPagination({
      page: query.page,
      pageSize: query.pageSize,
    });
    const filters: Prisma.NewsPostWhereInput[] = [];

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

    const whereClause = publishedNewsListWhere(filters);
    const [total, news] = await findPublishedNewsApiPaginated({
      where: whereClause,
      orderBy: [{ publishAt: "desc" }, { createdAt: "desc" }],
      skip: pagination.skip,
      take: pagination.take,
    });

    const items = news.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      contentRich: item.contentRich as Record<string, unknown>,
      status: "PUBLISHED" as const,
      publishAt: item.publishAt?.toISOString() ?? null,
      category: {
        id: item.category.id,
        name: item.category.nameVN,
        slug: item.category.slug,
        iconKey: item.category.iconKey,
      },
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
