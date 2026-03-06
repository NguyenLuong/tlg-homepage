import { type NextRequest } from "next/server";

import { EntityType, JobStatus, Prisma } from "@prisma/client";

import { writeJobCreateAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  createJob,
  findAdminJobDetailOrThrow,
  findAdminJobsList,
  type AdminJobSummary,
  type AdminJobDetail,
} from "@/lib/db/repositories/jobs";
import {
  apiAdminCreated,
  apiAdminErrorFromUnknown,
  apiAdminOk,
} from "@/lib/http/api-response";
import { writeRevisionSnapshot } from "@/lib/revision/snapshot";
import { parseAdminJobCreatePayload } from "@/lib/validation/schemas";

function serializeAdminJobSummary(job: AdminJobSummary) {
  return job;
}

function serializeAdminJobDetail(job: AdminJobDetail) {
  return job;
}

export async function GET(request: NextRequest) {
  try {
    await requireEditor(request);

    const items = await findAdminJobsList();

    return apiAdminOk({
      items: items.map((item) => serializeAdminJobSummary(item)),
    });
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor(request);
    const payload = parseAdminJobCreatePayload(await request.json());

    const created = await prisma.$transaction(async (tx) => {
      const job = await createJob(
        {
          title: payload.title,
          slug: payload.slug,
          locationPrefectureId: payload.locationPrefectureId,
          salaryText: payload.salaryText,
          benefits: payload.benefits as Prisma.InputJsonValue,
          descriptionRich: payload.descriptionRich as Prisma.InputJsonValue,
          heroImageId: payload.heroImageId ?? null,
          status: JobStatus.DRAFT,
          createdById: user.id,
          updatedById: user.id,
        },
        tx,
      );

      const hydratedJob = await findAdminJobDetailOrThrow(job.id, tx);

      await writeRevisionSnapshot(
        {
          entityType: EntityType.JOB,
          entityId: hydratedJob.id,
          createdById: user.id,
          snapshotJson: JSON.parse(
            JSON.stringify(hydratedJob),
          ) as Prisma.InputJsonValue,
        },
        tx,
      );

      await writeJobCreateAuditLog(
        {
          entityId: hydratedJob.id,
          createdById: user.id,
          metaJson: {
            title: hydratedJob.title,
            slug: hydratedJob.slug,
            status: hydratedJob.status,
          },
        },
        tx,
      );

      return serializeAdminJobDetail(hydratedJob);
    });

    return apiAdminCreated(created);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
