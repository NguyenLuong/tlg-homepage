"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

import {
  useDeleteJob,
  useFeatureJob,
  useJobsList,
  usePrefetchJobDetail,
  usePublishJob,
  useUnpublishJob,
  type JobListResponse,
  type JobStatus,
} from "@/lib/queries/jobs";

const DeleteJobButton = dynamic(() => import("./delete-job-button"), {
  ssr: false,
  loading: () => (
    <Button size="sm" variant="destructive" disabled>
      Delete
    </Button>
  ),
});

// ── Constants ──────────────────────────────────────────────

const STATUS_LABEL: Record<JobStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  CLOSED: "Closed",
};

const STATUS_BADGE_VARIANT: Record<
  JobStatus,
  "secondary" | "default" | "outline" | "destructive"
> = {
  DRAFT: "secondary",
  SCHEDULED: "outline",
  PUBLISHED: "default",
  CLOSED: "destructive",
};

// ── Helpers ────────────────────────────────────────────────

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// ── Component ──────────────────────────────────────────────

type Props = {
  initialData: JobListResponse;
};

export default function JobsListClient({ initialData }: Props) {
  const { data } = useJobsList(initialData);
  const prefetchDetail = usePrefetchJobDetail();
  const deleteJob = useDeleteJob();
  const publishJob = usePublishJob();
  const unpublishJob = useUnpublishJob();
  const featureJob = useFeatureJob();

  const isMutating =
    deleteJob.isPending ||
    publishJob.isPending ||
    unpublishJob.isPending ||
    featureJob.isPending;

  const items = data?.items ?? initialData.items;
  const featuredCount = items.filter((item) => item.isFeatured).length;

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Featured on home page:</span>
        <Badge variant={featuredCount >= 3 ? "default" : "secondary"}>
          {featuredCount} / 3
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon="💼"
              title="No job posts yet"
              description="Get started by creating your first job posting."
              action={{
                label: "Create First Job",
                href: "/admin/jobs/new",
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-225 w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Prefecture</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Featured</th>
                    <th className="px-3 py-2">Salary</th>
                    <th className="px-3 py-2">Benefits</th>
                    <th className="px-3 py-2">Updated</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((job) => (
                    <tr key={job.id} className="text-slate-700">
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900">
                          {job.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          /{job.slug}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {job.prefecture.nameJP
                          ? `${job.prefecture.nameJP} - ${job.prefecture.nameVN}`
                          : job.prefecture.nameVN}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={STATUS_BADGE_VARIANT[job.status]}>
                          {STATUS_LABEL[job.status]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        {job.status === "PUBLISHED" || job.isFeatured ? (
                          <Button
                            size="sm"
                            variant={job.isFeatured ? "default" : "outline"}
                            disabled={isMutating}
                            onClick={() => {
                              if (!job.isFeatured && featuredCount >= 3) {
                                toast.error(
                                  "Maximum 3 featured jobs allowed. Please unfeature another job first.",
                                );
                                return;
                              }
                              featureJob.mutate(
                                { id: job.id, isFeatured: !job.isFeatured },
                                {
                                  onError: (err) =>
                                    toast.error(
                                      err instanceof Error
                                        ? err.message
                                        : "Failed to update featured status",
                                    ),
                                },
                              );
                            }}
                          >
                            {job.isFeatured ? "★ Featured" : "☆ Feature"}
                          </Button>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        {job.salaryText || "-"}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        {job?.benefits?.length > 0
                          ? job.benefits.join(", ")
                          : "-"}
                      </td>
                      <td className="px-3 py-3">{formatDate(job.updatedAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild size="sm">
                            <Link
                              href={`/admin/jobs/${job.id}`}
                              onMouseEnter={() => prefetchDetail(job.id)}
                            >
                              Edit
                            </Link>
                          </Button>

                          {(job.status === "DRAFT" ||
                            job.status === "SCHEDULED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isMutating}
                              onClick={() => publishJob.mutate(job.id)}
                            >
                              Publish
                            </Button>
                          )}

                          {job.status === "PUBLISHED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isMutating}
                              onClick={() => unpublishJob.mutate(job.id)}
                            >
                              Unpublish
                            </Button>
                          )}

                          <DeleteJobButton
                            jobId={job.id}
                            jobTitle={job.title}
                            disabled={isMutating}
                            onDelete={(id) => deleteJob.mutate(id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
