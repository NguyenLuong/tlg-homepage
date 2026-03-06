import { type NextRequest, NextResponse } from "next/server";

import { EntityType, Prisma } from "@prisma/client";

import { writeJobUpdateAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  countFeaturedJobs,
  findJobByIdOrThrow,
  setJobFeatured,
} from "@/lib/db/repositories/jobs";
import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { writeRevisionSnapshot } from "@/lib/revision/snapshot";
import {
  parseAdminJobFeaturePayload,
  parseUuidValue,
  ValidationError,
} from "@/lib/validation/schemas";

const MAX_FEATURED_JOBS = 3;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireEditor(request);
    const { id } = await params;
    const jobId = parseUuidValue(id, "id");
    const { isFeatured } = parseAdminJobFeaturePayload(await request.json());

    // Pre-transaction guards (read-only checks)
    const existing = await findJobByIdOrThrow(jobId);

    if (isFeatured) {
      if (existing.status !== "PUBLISHED") {
        return NextResponse.json(
          {
            error: {
              message: "Only published jobs can be featured.",
              field: "isFeatured",
            },
          },
          { status: 422 },
        );
      }

      const currentCount = await countFeaturedJobs(jobId);
      if (currentCount >= MAX_FEATURED_JOBS) {
        throw new ValidationError(
          "isFeatured",
          `At most ${MAX_FEATURED_JOBS} jobs can be featured at the same time.`,
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const job = await setJobFeatured(jobId, isFeatured, user.id, tx);

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

      await writeJobUpdateAuditLog(
        {
          entityId: job.id,
          createdById: user.id,
          metaJson: {
            fields: ["isFeatured"],
            fromStatus: existing.status,
            toStatus: job.status,
          },
        },
        tx,
      );

      return job;
    });

    return apiAdminOk({ id: updated.id, isFeatured });
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
