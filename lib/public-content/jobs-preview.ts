import type { Prisma } from "@prisma/client";

import { findFeaturedPublishedJobs } from "@/lib/db/repositories/jobs";

export type HomeJobsPreviewItem = {
  id: string;
  slug: string;
  title: string;
  salaryText: string;
  benefits: string[];
  descriptionRich: Record<string, unknown>;
  status: "PUBLISHED";
  publishAt: string | null;
  heroImage: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
  prefecture: string;
};

function normalizeBenefits(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export async function getHomeJobsPreview(): Promise<HomeJobsPreviewItem[]> {
  const jobs = await findFeaturedPublishedJobs();

  return jobs.map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    salaryText: job.salaryText,
    benefits: normalizeBenefits(job.benefits),
    descriptionRich: job.descriptionRich as Record<string, unknown>,
    status: "PUBLISHED",
    publishAt: job.publishAt?.toISOString() ?? null,
    heroImage: job.heroImage ?? null,
    prefecture: job.prefecture.nameVN,
  }));
}
