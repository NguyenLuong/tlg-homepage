import { type NextRequest } from "next/server";

import { EntityType, NewsStatus, Prisma } from "@prisma/client";

import { writeNewsCreateAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  createNews,
  findAdminNewsList,
  type AdminNewsSummary,
  type AdminNewsDetail,
} from "@/lib/db/repositories/news";
import {
  apiAdminCreated,
  apiAdminErrorFromUnknown,
  apiAdminOk,
} from "@/lib/http/api-response";
import { writeRevisionSnapshot } from "@/lib/revision/snapshot";
import { generateSlug, makeSlugUnique } from "@/lib/utils/slug";
import {
  parseAdminNewsCreatePayload,
  ValidationError,
} from "@/lib/validation/schemas";

/** Resolve a unique slug for a news post based on the title */
async function resolveUniqueNewsSlug(title: string): Promise<string> {
  const base = generateSlug(title) || "news";
  const rows = await prisma.newsPost.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  const existing = rows.map((r) => r.slug);
  return makeSlugUnique(base, existing);
}

function serializeAdminNewsSummary(news: AdminNewsSummary) {
  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    status: news.status,
    publishAt: news.publishAt,
    scheduledAt: news.scheduledAt,
    updatedAt: news.updatedAt,
    category: news.category,
  };
}

function serializeAdminNewsDetail(news: AdminNewsDetail) {
  return {
    id: news.id,
    title: news.title,
    slug: news.slug,
    contentRich: news.contentRich,
    categoryId: news.categoryId,
    status: news.status,
    publishAt: news.publishAt,
    scheduledAt: news.scheduledAt,
    updatedAt: news.updatedAt,
    category: news.category,
  };
}

function validateCreateLifecycleFields(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return;
  }

  const input = payload as Record<string, unknown>;

  if (Object.prototype.hasOwnProperty.call(input, "status")) {
    throw new ValidationError(
      "status",
      "cannot be set on create; use publish/schedule endpoints",
    );
  }

  if (Object.prototype.hasOwnProperty.call(input, "publishAt")) {
    throw new ValidationError(
      "publishAt",
      "cannot be set on create; use the publish endpoint",
    );
  }

  if (Object.prototype.hasOwnProperty.call(input, "scheduledAt")) {
    throw new ValidationError(
      "scheduledAt",
      "cannot be set on create; use the schedule endpoint",
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireEditor(request);

    const items = await findAdminNewsList();

    return apiAdminOk({
      items: items.map((item) => serializeAdminNewsSummary(item)),
    });
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor(request);
    const rawPayload = await request.json();
    validateCreateLifecycleFields(rawPayload);
    const payload = parseAdminNewsCreatePayload(rawPayload);

    const slug = await resolveUniqueNewsSlug(payload.title);

    const created = await prisma.$transaction(async (tx) => {
      const news = await createNews(
        {
          title: payload.title,
          slug,
          contentRich: payload.contentRich as Prisma.InputJsonValue,
          categoryId: payload.categoryId,
          status: NewsStatus.DRAFT,
          createdById: user.id,
          updatedById: user.id,
        },
        tx,
      );

      await writeRevisionSnapshot(
        {
          entityType: EntityType.NEWS,
          entityId: news.id,
          createdById: user.id,
          snapshotJson: JSON.parse(
            JSON.stringify(news),
          ) as Prisma.InputJsonValue,
        },
        tx,
      );

      await writeNewsCreateAuditLog(
        {
          entityId: news.id,
          createdById: user.id,
          metaJson: {
            title: news.title,
            slug: news.slug,
            status: news.status,
          },
        },
        tx,
      );

      return serializeAdminNewsDetail(news);
    });

    return apiAdminCreated(created);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
