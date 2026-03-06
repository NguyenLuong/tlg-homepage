import { type NextRequest } from "next/server";

import { EntityType, JobStatus, Prisma } from "@prisma/client";

import { writeJobPublishAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  findJobByIdOrThrow,
  updateJobStatus,
} from "@/lib/db/repositories/jobs";
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
    const jobId = parseUuidValue(id, "id");

    const unpublished = await prisma.$transaction(async (tx) => {
      const existing = await findJobByIdOrThrow(jobId, tx);

      if (existing.status !== JobStatus.PUBLISHED) {
        throw new InvalidPublishTransitionError(
          `Jobs in ${existing.status} status cannot be unpublished.`,
        );
      }

      const job = await updateJobStatus(
        jobId,
        {
          status: JobStatus.DRAFT,
          publishAt: null,
          scheduledAt: null,
          updatedById: user.id,
          updatedAt: existing.updatedAt,
        },
        tx,
      );

      await writeRevisionSnapshot(
        {
          entityType: EntityType.JOB,
          entityId: existing.id,
          createdById: user.id,
          snapshotJson: JSON.parse(
            JSON.stringify(existing),
          ) as Prisma.InputJsonValue,
        },
        tx,
      );

      await writeJobPublishAuditLog(
        {
          entityId: job.id,
          createdById: user.id,
          metaJson: {
            fromStatus: existing.status,
            toStatus: job.status,
            publishAt: job.publishAt?.toISOString() ?? null,
          },
        },
        tx,
      );

      return job;
    });

    return apiAdminOk(unpublished);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
