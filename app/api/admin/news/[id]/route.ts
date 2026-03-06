import { type NextRequest, NextResponse } from "next/server";

import { EntityType, Prisma } from "@prisma/client";

import {
  writeNewsDeleteAuditLog,
  writeNewsUpdateAuditLog,
} from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import { findAdminNewsCategories } from "@/lib/db/repositories/lookups";
import {
  deleteNews,
  findAdminNewsById,
  findNewsByIdOrThrow,
  updateNews,
} from "@/lib/db/repositories/news";
import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { writeRevisionSnapshot } from "@/lib/revision/snapshot";
import { generateSlug, makeSlugUnique } from "@/lib/utils/slug";
import {
  parseAdminNewsUpdatePayload,
  parseDeleteConfirmationQueryParams,
  parseUuidValue,
} from "@/lib/validation/schemas";

function toContentRichObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

/** Resolve a unique slug for a news post based on title, excluding current post */
async function resolveUniqueNewsSlug(
  title: string,
  currentSlug: string,
): Promise<string> {
  const base = generateSlug(title) || "news";
  const rows = await prisma.newsPost.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  const existing = rows.map((r) => r.slug);
  return makeSlugUnique(base, existing, currentSlug);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireEditor(request);
    const { id } = await params;
    const newsId = parseUuidValue(id, "id");

    const [news, categories] = await Promise.all([
      findAdminNewsById(newsId),
      findAdminNewsCategories(),
    ]);

    if (!news) {
      return NextResponse.json(
        { error: { message: "News not found" } },
        { status: 404 },
      );
    }

    return apiAdminOk({
      news: {
        id: news.id,
        title: news.title,
        slug: news.slug,
        contentRich: toContentRichObject(news.contentRich),
        categoryId: news.categoryId,
        status: news.status,
        updatedAt: news.updatedAt.toISOString(),
        publishAt: news.publishAt?.toISOString() ?? null,
      },
      categories,
    });
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireEditor(request);
    const { id } = await params;
    const newsId = parseUuidValue(id, "id");
    const payload = parseAdminNewsUpdatePayload(await request.json());

    // Resolve slug outside transaction when title changes
    let resolvedSlug: string | undefined;

    if (payload.title !== undefined) {
      // Need existing slug to do uniqueness check - fetch first
      const existing = await prisma.newsPost.findUniqueOrThrow({
        where: { id: newsId },
        select: { slug: true },
      });
      resolvedSlug = await resolveUniqueNewsSlug(payload.title, existing.slug);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await findNewsByIdOrThrow(newsId, tx);

      const updateData: Prisma.NewsPostUncheckedUpdateInput = {
        updatedById: user.id,
      };

      if (payload.title !== undefined) {
        updateData.title = payload.title;
      }
      if (resolvedSlug !== undefined) {
        updateData.slug = resolvedSlug;
      }
      if (payload.contentRich !== undefined) {
        updateData.contentRich = payload.contentRich as Prisma.InputJsonValue;
      }
      if (payload.categoryId !== undefined) {
        updateData.categoryId = payload.categoryId;
      }

      const news = await updateNews(newsId, updateData, tx);

      await writeRevisionSnapshot(
        {
          entityType: EntityType.NEWS,
          entityId: existing.id,
          createdById: user.id,
          snapshotJson: JSON.parse(
            JSON.stringify(existing),
          ) as Prisma.InputJsonValue,
        },
        tx,
      );

      await writeNewsUpdateAuditLog(
        {
          entityId: news.id,
          createdById: user.id,
          metaJson: {
            fields: Object.keys(payload).sort(),
            fromStatus: existing.status,
            toStatus: news.status,
          },
        },
        tx,
      );

      return news;
    });

    return apiAdminOk(updated);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireEditor(request);
    const { id } = await params;
    const newsId = parseUuidValue(id, "id");

    parseDeleteConfirmationQueryParams(request.nextUrl.searchParams);

    await prisma.$transaction(async (tx) => {
      const existing = await findNewsByIdOrThrow(newsId, tx);

      await writeRevisionSnapshot(
        {
          entityType: EntityType.NEWS,
          entityId: existing.id,
          createdById: user.id,
          snapshotJson: JSON.parse(
            JSON.stringify(existing),
          ) as Prisma.InputJsonValue,
        },
        tx,
      );

      await deleteNews(newsId, tx);

      await writeNewsDeleteAuditLog(
        {
          entityId: existing.id,
          createdById: user.id,
          metaJson: {
            fromStatus: existing.status,
            deletedAt: new Date().toISOString(),
            title: existing.title,
            slug: existing.slug,
          },
        },
        tx,
      );
    });

    return apiAdminOk({
      id: newsId,
      deleted: true as const,
    });
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
