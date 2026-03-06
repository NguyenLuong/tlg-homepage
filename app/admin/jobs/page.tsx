import Link from "next/link";

import { Button } from "@/components/ui/button";
import { findAdminJobsList } from "@/lib/db/repositories/jobs";

import JobsListClient from "./jobs-list-client";

export default async function AdminJobsListPage() {
  const jobs = await findAdminJobsList();

  const initialData = {
    items: jobs.map((job) => ({
      ...job,
      benefits: job.benefits as string[],
      publishAt: job.publishAt?.toISOString() ?? null,
      scheduledAt: job.scheduledAt?.toISOString() ?? null,
      updatedAt: job.updatedAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage draft and published job postings.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/jobs/new">Create New Job</Link>
        </Button>
      </section>

      <JobsListClient initialData={initialData} />
    </div>
  );
}
