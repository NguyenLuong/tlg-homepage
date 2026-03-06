import { type NextRequest } from "next/server";

import { EntityType, NewsStatus, Prisma } from "@prisma/client";

import { writeNewsScheduleAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  findNewsByIdOrThrow,
  updateNewsStatus,
} from "@/lib/db/repositories/news";
import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { writeRevisionSnapshot } from "@/lib/revision/snapshot";
import {
  InvalidScheduleDateError,
  InvalidScheduleTransitionError,
  parseSchedulePayloadEnvelope,
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
    const { payload } = parseSchedulePayloadEnvelope(await request.json());

    if (payload.scheduledAt.getTime() <= Date.now()) {
      throw new InvalidScheduleDateError("scheduledAt must be in the future.");
    }

    const scheduled = await prisma.$transaction(async (tx) => {
      const existing = await findNewsByIdOrThrow(newsId, tx);

      if (
        existing.status !== NewsStatus.DRAFT &&
        existing.status !== NewsStatus.SCHEDULED
      ) {
        throw new InvalidScheduleTransitionError(
          `News in ${existing.status} status cannot be scheduled.`,
        );
      }

      const news = await updateNewsStatus(
        newsId,
        {
          status: NewsStatus.SCHEDULED,
          scheduledAt: payload.scheduledAt,
          publishAt: null,
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

      await writeNewsScheduleAuditLog(
        {
          entityId: news.id,
          createdById: user.id,
          metaJson: {
            fromStatus: existing.status,
            toStatus: news.status,
            scheduledAt: news.scheduledAt?.toISOString() ?? null,
          },
        },
        tx,
      );

      return news;
    });

    return apiAdminOk(scheduled);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
