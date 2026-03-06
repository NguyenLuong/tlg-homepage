import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { findAdminJobById } from "@/lib/db/repositories/jobs";
import { findAdminPrefectures } from "@/lib/db/repositories/lookups";
import { findRecentMediaAssets } from "@/lib/db/repositories/media";
import type { JobDetailResponse } from "@/lib/queries/jobs";

import JobEditorForm from "./job-editor-form-dynamic";

type AdminJobEditorPageProps = {
  params: Promise<{ id: string }>;
};

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

export default async function AdminJobEditorPage({
  params,
}: AdminJobEditorPageProps) {
  const { id } = await params;

  const [job, prefectures, mediaAssets] = await Promise.all([
    findAdminJobById(id),
    findAdminPrefectures(),
    findRecentMediaAssets(),
  ]);

  if (!job) {
    notFound();
  }

  const hasCurrentPrefecture = prefectures.some(
    (prefecture) => prefecture.id === job.locationPrefectureId,
  );
  const prefectureOptions = hasCurrentPrefecture
    ? prefectures
    : [
        {
          id: job.locationPrefectureId,
          nameJP: "Current Prefecture",
          nameVN: "Current Prefecture",
          code: "current",
        },
        ...prefectures,
      ];

  // Pass as initialData for TanStack Query
  const initialData: JobDetailResponse = {
    job: {
      id: job.id,
      title: job.title,
      slug: job.slug,
      heroImageId: job.heroImageId,
      locationPrefectureId: job.locationPrefectureId,
      salaryText: job.salaryText,
      benefits: toStringArray(job.benefits),
      descriptionRich: toObject(job.descriptionRich),
      status: job.status as JobDetailResponse["job"]["status"],
      isFeatured: job.isFeatured,
      publishAt: job.publishAt?.toISOString() ?? null,
      scheduledAt: job.scheduledAt?.toISOString() ?? null,
      updatedAt: job.updatedAt.toISOString(),
    },
    prefectures: prefectureOptions,
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
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Edit Job
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Update draft details and publish when ready.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/jobs">Back to Jobs</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/jobs/new">Create New Job</Link>
          </Button>
        </div>
      </section>

      <JobEditorForm jobId={id} initialData={initialData} />
    </div>
  );
}
