import { type NextRequest } from "next/server";

import { EntityType, NewsStatus, Prisma } from "@prisma/client";

import { writeNewsUpdateAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  findNewsByIdOrThrow,
  updateNewsStatus,
} from "@/lib/db/repositories/news";
import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { writeRevisionSnapshot } from "@/lib/revision/snapshot";
import {
  InvalidPublishTransitionError,
  parseUuidValue,
} from "@/lib/validation/schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireEditor(request);
    const { id } = await params;
    const newsId = parseUuidValue(id, "id");

    const unpublished = await prisma.$transaction(async (tx) => {
      const existing = await findNewsByIdOrThrow(newsId, tx);

      if (existing.status !== NewsStatus.PUBLISHED) {
        throw new InvalidPublishTransitionError(
          `News in ${existing.status} status cannot be unpublished.`,
        );
      }

      const news = await updateNewsStatus(
        newsId,
        {
          status: NewsStatus.DRAFT,
          publishAt: null,
          scheduledAt: null,
          updatedById: user.id,
        },
        tx,
      );

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
            fields: ["status", "publishAt"],
            fromStatus: existing.status,
            toStatus: news.status,
          },
        },
        tx,
      );

      return news;
    });

    return apiAdminOk({
      status: unpublished.status,
      publishAt: unpublished.publishAt?.toISOString() ?? null,
      scheduledAt: null,
      updatedAt: unpublished.updatedAt.toISOString(),
    });
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
