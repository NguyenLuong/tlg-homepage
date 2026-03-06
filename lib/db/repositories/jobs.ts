import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";

import prisma from "@/lib/db/prisma";
import {
  publishedJobsDetailWhere,
  publishedJobsFilter,
} from "@/lib/public-content/published-filters";

// ── Shared DB client type ──────────────────────────────────
export type DbClient = PrismaClient | Prisma.TransactionClient;

// ── Select shapes ──────────────────────────────────────────

export const publicJobCardSelect = Prisma.validator<Prisma.JobPostSelect>()({
  id: true,
  title: true,
  slug: true,
  isFeatured: true,
  salaryText: true,
  benefits: true,
  publishAt: true,
  prefecture: {
    select: {
      id: true,
      nameJP: true,
      nameVN: true,
      code: true,
    },
  },
  heroImage: {
    select: { url: true, altText: true, width: true, height: true },
  },
});

export const publicJobDetailSelect = Prisma.validator<Prisma.JobPostSelect>()({
  id: true,
  title: true,
  slug: true,
  salaryText: true,
  benefits: true,
  descriptionRich: true,
  publishAt: true,
  updatedAt: true,
  prefecture: {
    select: { nameJP: true, nameVN: true, code: true },
  },
  heroImage: {
    select: { url: true, altText: true, width: true, height: true },
  },
});

export const jobOgImageSelect = Prisma.validator<Prisma.JobPostSelect>()({
  title: true,
  salaryText: true,
  publishAt: true,
  prefecture: { select: { nameJP: true, nameVN: true } },
  heroImage: { select: { url: true, altText: true } },
});

export const jobSitemapSelect = Prisma.validator<Prisma.JobPostSelect>()({
  slug: true,
  updatedAt: true,
  publishAt: true,
});

export const jobPreviewSelect = Prisma.validator<Prisma.JobPostSelect>()({
  id: true,
  slug: true,
  title: true,
  isFeatured: true,
  salaryText: true,
  benefits: true,
  descriptionRich: true,
  status: true,
  publishAt: true,
  heroImage: {
    select: { url: true, altText: true, width: true, height: true },
  },
  prefecture: {
    select: { nameVN: true },
  },
});

export const adminJobSummarySelect = Prisma.validator<Prisma.JobPostSelect>()({
  id: true,
  title: true,
  slug: true,
  status: true,
  isFeatured: true,
  salaryText: true,
  benefits: true,
  publishAt: true,
  scheduledAt: true,
  updatedAt: true,
  prefecture: {
    select: { id: true, nameJP: true, nameVN: true, code: true },
  },
});

export const adminJobDetailSelect = Prisma.validator<Prisma.JobPostSelect>()({
  id: true,
  title: true,
  slug: true,
  status: true,
  publishAt: true,
  scheduledAt: true,
  updatedAt: true,
  locationPrefectureId: true,
  salaryText: true,
  benefits: true,
  descriptionRich: true,
  heroImageId: true,
  prefecture: {
    select: { id: true, nameJP: true, nameVN: true, code: true },
  },
});

/** Select used by admin page component (lighter than API summary). */
export const adminJobPageSelect = Prisma.validator<Prisma.JobPostSelect>()({
  id: true,
  title: true,
  slug: true,
  status: true,
  isFeatured: true,
  publishAt: true,
  scheduledAt: true,
  updatedAt: true,
  prefecture: { select: { nameJP: true, nameVN: true } },
});

/** Select used by admin job editor page. */
export const adminJobEditorSelect = Prisma.validator<Prisma.JobPostSelect>()({
  id: true,
  title: true,
  slug: true,
  isFeatured: true,
  heroImageId: true,
  locationPrefectureId: true,
  salaryText: true,
  benefits: true,
  descriptionRich: true,
  status: true,
  publishAt: true,
  scheduledAt: true,
  updatedAt: true,
});

// ── Derived types ──────────────────────────────────────────

export type PublicJobCard = Prisma.JobPostGetPayload<{
  select: typeof publicJobCardSelect;
}>;

export type PublicJobDetail = Prisma.JobPostGetPayload<{
  select: typeof publicJobDetailSelect;
}>;

export type JobOgImage = Prisma.JobPostGetPayload<{
  select: typeof jobOgImageSelect;
}>;

export type JobSitemapEntry = Prisma.JobPostGetPayload<{
  select: typeof jobSitemapSelect;
}>;

export type JobPreviewItem = Prisma.JobPostGetPayload<{
  select: typeof jobPreviewSelect;
}>;

export type AdminJobSummary = Prisma.JobPostGetPayload<{
  select: typeof adminJobSummarySelect;
}>;

export type AdminJobDetail = Prisma.JobPostGetPayload<{
  select: typeof adminJobDetailSelect;
}>;

export type AdminJobPageItem = Prisma.JobPostGetPayload<{
  select: typeof adminJobPageSelect;
}>;

export type AdminJobEditorItem = Prisma.JobPostGetPayload<{
  select: typeof adminJobEditorSelect;
}>;

// ── Public read queries ────────────────────────────────────

/** Count + paginated list for the public jobs listing page. */
export async function findPublishedJobsPaginated(opts: {
  where: Prisma.JobPostWhereInput;
  orderBy: Prisma.JobPostOrderByWithRelationInput[];
  skip: number;
  take: number;
}): Promise<[total: number, jobs: PublicJobCard[]]> {
  return prisma.$transaction([
    prisma.jobPost.count({ where: opts.where }),
    prisma.jobPost.findMany({
      where: opts.where,
      orderBy: opts.orderBy,
      skip: opts.skip,
      take: opts.take,
      select: publicJobCardSelect,
    }),
  ]) as Promise<[number, PublicJobCard[]]>;
}

/** Single published job for the detail page. */
export async function findPublishedJobDetail(
  where: Prisma.JobPostWhereInput,
  db: DbClient = prisma,
): Promise<PublicJobDetail | null> {
  return db.jobPost.findFirst({
    where,
    select: publicJobDetailSelect,
  });
}

/** Job data for Open Graph image rendering. */
export async function findPublishedJobForOgImage(
  slug: string,
  db: DbClient = prisma,
): Promise<JobOgImage | null> {
  return db.jobPost.findFirst({
    where: {
      slug,
      ...publishedJobsFilter(),
    },
    select: jobOgImageSelect,
  });
}

/** Published jobs for sitemap generation. */
export async function findPublishedJobsForSitemap(
  now?: Date,
  db: DbClient = prisma,
): Promise<JobSitemapEntry[]> {
  return db.jobPost.findMany({
    where: publishedJobsFilter(now),
    select: jobSitemapSelect,
  });
}

/** Published jobs preview for homepage. */
export async function findPublishedJobsPreview(
  limit: number = 3,
  db: DbClient = prisma,
): Promise<JobPreviewItem[]> {
  return db.jobPost.findMany({
    where: publishedJobsFilter(),
    orderBy: [{ publishAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: jobPreviewSelect,
  });
}

/** Featured published jobs for homepage (max 3). */
export async function findFeaturedPublishedJobs(
  db: DbClient = prisma,
): Promise<JobPreviewItem[]> {
  return db.jobPost.findMany({
    where: { isFeatured: true, ...publishedJobsFilter() },
    orderBy: [{ publishAt: "desc" }, { createdAt: "desc" }],
    select: jobPreviewSelect,
  });
}

/**
 * Count currently featured jobs, optionally excluding one ID (for toggle guard).
 */
export async function countFeaturedJobs(
  excludeId?: string,
  db: DbClient = prisma,
): Promise<number> {
  return db.jobPost.count({
    where: {
      isFeatured: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

/** Set the isFeatured flag on a job (no status check — caller must guard). */
export async function setJobFeatured(
  id: string,
  isFeatured: boolean,
  updatedById: string,
  db: DbClient = prisma,
) {
  return db.jobPost.update({
    where: { id },
    data: { isFeatured, updatedById },
  });
}

// ── Admin read queries ─────────────────────────────────────

/** Admin listing page (RSC). */
export async function findAdminJobsPageList(
  db: DbClient = prisma,
): Promise<AdminJobPageItem[]> {
  return db.jobPost.findMany({
    select: adminJobPageSelect,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

/** Admin API listing (richer payload). */
export async function findAdminJobsList(
  db: DbClient = prisma,
): Promise<AdminJobSummary[]> {
  return db.jobPost.findMany({
    select: adminJobSummarySelect,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

/** Admin job editor page. */
export async function findAdminJobById(
  id: string,
  db: DbClient = prisma,
): Promise<AdminJobEditorItem | null> {
  return db.jobPost.findUnique({
    where: { id },
    select: adminJobEditorSelect,
  });
}

/** Hydrated admin detail after create (used in transaction). */
export async function findAdminJobDetailOrThrow(
  id: string,
  db: DbClient = prisma,
): Promise<AdminJobDetail> {
  return db.jobPost.findUniqueOrThrow({
    where: { id },
    select: adminJobDetailSelect,
  });
}

// ── Mutation helpers (for use inside transactions) ─────────

/** Pre-mutation existence check (throws if not found). */
export async function findJobByIdOrThrow(id: string, db: DbClient = prisma) {
  return db.jobPost.findUniqueOrThrow({ where: { id } });
}

/** Create a new job post. */
export async function createJob(
  data: Prisma.JobPostUncheckedCreateInput,
  db: DbClient = prisma,
) {
  return db.jobPost.create({ data });
}

/** Update a job post (with relation includes for response). */
export async function updateJob(
  id: string,
  data: Prisma.JobPostUncheckedUpdateInput,
  db: DbClient = prisma,
) {
  return db.jobPost.update({
    where: { id },
    data,
    include: {
      prefecture: {
        select: { id: true, nameJP: true, nameVN: true, code: true },
      },
    },
  });
}

/** Delete a job post. */
export async function deleteJob(id: string, db: DbClient = prisma) {
  return db.jobPost.delete({ where: { id } });
}

/** Find scheduled jobs due for publishing. */
export async function findScheduledJobsDue(now: Date, db: DbClient = prisma) {
  return db.jobPost.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
  });
}

/** Update job status (for publish/schedule operations). */
export async function updateJobStatus(
  id: string,
  data: Prisma.JobPostUncheckedUpdateInput,
  db: DbClient = prisma,
) {
  return db.jobPost.update({
    where: { id },
    data,
    include: {
      prefecture: {
        select: { id: true, nameJP: true, nameVN: true, code: true },
      },
    },
  });
}

// ── Public API queries ─────────────────────────────────────

/** Public API listing with includes (richer than page component select). */
export async function findPublishedJobsApiPaginated(opts: {
  where: Prisma.JobPostWhereInput;
  orderBy: Prisma.JobPostOrderByWithRelationInput[];
  skip: number;
  take: number;
}) {
  return prisma.$transaction([
    prisma.jobPost.count({ where: opts.where }),
    prisma.jobPost.findMany({
      where: opts.where,
      orderBy: opts.orderBy,
      skip: opts.skip,
      take: opts.take,
      include: {
        prefecture: {
          select: { id: true, nameJP: true, nameVN: true, code: true },
        },
        heroImage: {
          select: {
            id: true,
            url: true,
            width: true,
            height: true,
            altText: true,
          },
        },
      },
    }),
  ]);
}

/** Public API single job detail with includes. */
export async function findPublishedJobApiDetail(
  slug: string,
  db: DbClient = prisma,
) {
  return db.jobPost.findFirst({
    where: publishedJobsDetailWhere(slug),
    include: {
      prefecture: {
        select: { id: true, nameJP: true, nameVN: true, code: true },
      },
      heroImage: {
        select: {
          id: true,
          url: true,
          width: true,
          height: true,
          altText: true,
        },
      },
    },
  });
}
