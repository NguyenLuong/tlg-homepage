import { type NextRequest, NextResponse } from "next/server";

import { EntityType, Prisma } from "@prisma/client";

import {
  writeJobDeleteAuditLog,
  writeJobUpdateAuditLog,
} from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  deleteJob,
  findAdminJobById,
  findJobByIdOrThrow,
  updateJob,
  countFeaturedJobs,
} from "@/lib/db/repositories/jobs";
import { findAdminPrefectures } from "@/lib/db/repositories/lookups";
import { findRecentMediaAssets } from "@/lib/db/repositories/media";
import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { writeRevisionSnapshot } from "@/lib/revision/snapshot";
import {
  parseAdminJobUpdatePayload,
  parseDeleteConfirmationQueryParams,
  parseUuidValue,
  ValidationError,
} from "@/lib/validation/schemas";

function toObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireEditor(request);
    const { id } = await params;
    const jobId = parseUuidValue(id, "id");

    const [job, prefectures, mediaAssets] = await Promise.all([
      findAdminJobById(jobId),
      findAdminPrefectures(),
      findRecentMediaAssets(),
    ]);

    if (!job) {
      return NextResponse.json(
        { error: { message: "Job not found" } },
        { status: 404 },
      );
    }

    return apiAdminOk({
      job: {
        id: job.id,
        title: job.title,
        slug: job.slug,
        heroImageId: job.heroImageId,
        locationPrefectureId: job.locationPrefectureId,
        salaryText: job.salaryText,
        benefits: toStringArray(job.benefits),
        descriptionRich: toObject(job.descriptionRich),
        status: job.status,
        isFeatured: job.isFeatured,
        publishAt: job.publishAt?.toISOString() ?? null,
        scheduledAt: job.scheduledAt?.toISOString() ?? null,
        updatedAt: job.updatedAt.toISOString(),
      },
      prefectures,
      mediaAssets: mediaAssets.map((asset) => ({
        id: asset.id,
        url: asset.url,
        publicId: asset.publicId,
        altText: asset.altText,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        mime: asset.mime,
        createdAt: asset.createdAt.toISOString(),
      })),
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
    const jobId = parseUuidValue(id, "id");
    const payload = parseAdminJobUpdatePayload(await request.json());

    // Pre-transaction featured guard
    if (payload.isFeatured === true) {
      const existing = await findJobByIdOrThrow(jobId);
      if (existing.status !== "PUBLISHED") {
        return NextResponse.json(
          {
            error: {
              message: "Only published jobs can be featured.",
            },
          },
          { status: 422 },
        );
      }
      const currentCount = await countFeaturedJobs(jobId);
      if (currentCount >= 3) {
        throw new ValidationError(
          "isFeatured",
          "At most 3 jobs can be featured at the same time.",
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await findJobByIdOrThrow(jobId, tx);

      const updateData: Prisma.JobPostUncheckedUpdateInput = {
        updatedById: user.id,
      };

      if (payload.title !== undefined) {
        updateData.title = payload.title;
      }
      if (payload.slug !== undefined) {
        updateData.slug = payload.slug;
      }
      if (payload.locationPrefectureId !== undefined) {
        updateData.locationPrefectureId = payload.locationPrefectureId;
      }
      if (payload.salaryText !== undefined) {
        updateData.salaryText = payload.salaryText;
      }
      if (payload.benefits !== undefined) {
        updateData.benefits = payload.benefits as Prisma.InputJsonValue;
      }
      if (payload.descriptionRich !== undefined) {
        updateData.descriptionRich =
          payload.descriptionRich as Prisma.InputJsonValue;
      }
      if (payload.heroImageId !== undefined) {
        updateData.heroImageId = payload.heroImageId;
      }
      if (payload.isFeatured !== undefined) {
        updateData.isFeatured = payload.isFeatured;
      }

      const job = await updateJob(jobId, updateData, tx);

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
            fields: Object.keys(payload).sort(),
            fromStatus: existing.status,
            toStatus: job.status,
          },
        },
        tx,
      );

      return job;
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
    const jobId = parseUuidValue(id, "id");

    parseDeleteConfirmationQueryParams(request.nextUrl.searchParams);

    await prisma.$transaction(async (tx) => {
      const existing = await findJobByIdOrThrow(jobId, tx);

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

      await deleteJob(jobId, tx);

      await writeJobDeleteAuditLog(
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
      id: jobId,
      deleted: true as const,
    });
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
