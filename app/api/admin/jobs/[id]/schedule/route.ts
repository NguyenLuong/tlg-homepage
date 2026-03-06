import { type NextRequest } from "next/server";

import { EntityType, JobStatus, Prisma } from "@prisma/client";

import { writeJobScheduleAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  findJobByIdOrThrow,
  updateJobStatus,
} from "@/lib/db/repositories/jobs";
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
    const jobId = parseUuidValue(id, "id");
    const { payload } = parseSchedulePayloadEnvelope(await request.json());

    if (payload.scheduledAt.getTime() <= Date.now()) {
      throw new InvalidScheduleDateError("scheduledAt must be in the future.");
    }

    const scheduled = await prisma.$transaction(async (tx) => {
      const existing = await findJobByIdOrThrow(jobId, tx);

      if (
        existing.status !== JobStatus.DRAFT &&
        existing.status !== JobStatus.SCHEDULED
      ) {
        throw new InvalidScheduleTransitionError(
          `Jobs in ${existing.status} status cannot be scheduled.`,
        );
      }

      const job = await updateJobStatus(
        jobId,
        {
          status: JobStatus.SCHEDULED,
          scheduledAt: payload.scheduledAt,
          publishAt: null,
          updatedById: user.id,
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

      await writeJobScheduleAuditLog(
        {
          entityId: job.id,
          createdById: user.id,
          metaJson: {
            fromStatus: existing.status,
            toStatus: job.status,
            scheduledAt: job.scheduledAt?.toISOString() ?? null,
          },
        },
        tx,
      );

      return job;
    });

    return apiAdminOk(scheduled);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
