import Link from "next/link";

import { Button } from "@/components/ui/button";
import { findAdminPrefectures } from "@/lib/db/repositories/lookups";
import { findRecentMediaAssets } from "@/lib/db/repositories/media";

import JobEditorForm from "../[id]/job-editor-form";

export default async function AdminJobCreatePage() {
  const [prefectures, mediaAssets] = await Promise.all([
    findAdminPrefectures(),
    findRecentMediaAssets(),
  ]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create Job
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter required details and create a draft job post.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/jobs">Back to Jobs</Link>
        </Button>
      </section>

      <JobEditorForm
        mode="create"
        prefectures={prefectures}
        availableAssets={mediaAssets.map((asset) => ({
          ...asset,
          createdAt: asset.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
