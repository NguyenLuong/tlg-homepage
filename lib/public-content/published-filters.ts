import { JobStatus, NewsStatus, type Prisma } from "@prisma/client";

type PublishWindowFilter = {
  OR: [
    { publishAt: null },
    { publishAt: { lte: Date } },
  ];
};

function createPublishWindowFilter(now: Date): PublishWindowFilter {
  return {
    OR: [
      { publishAt: null },
      { publishAt: { lte: now } },
    ],
  };
}

export function publishedNewsFilter(now: Date = new Date()): Prisma.NewsPostWhereInput {
  return {
    AND: [
      { status: NewsStatus.PUBLISHED },
      createPublishWindowFilter(now),
    ],
  };
}

export function publishedJobsFilter(now: Date = new Date()): Prisma.JobPostWhereInput {
  return {
    AND: [
      { status: JobStatus.PUBLISHED },
      createPublishWindowFilter(now),
    ],
  };
}

export function publishedNewsListWhere(
  filters: ReadonlyArray<Prisma.NewsPostWhereInput> = [],
  now: Date = new Date(),
): Prisma.NewsPostWhereInput {
  return {
    AND: [publishedNewsFilter(now), ...filters],
  };
}

export function publishedJobsListWhere(
  filters: ReadonlyArray<Prisma.JobPostWhereInput> = [],
  now: Date = new Date(),
): Prisma.JobPostWhereInput {
  return {
    AND: [publishedJobsFilter(now), ...filters],
  };
}

export function publishedNewsDetailWhere(
  slug: string,
  now: Date = new Date(),
): Prisma.NewsPostWhereInput {
  return {
    AND: [publishedNewsFilter(now), { slug }],
  };
}

export function publishedJobsDetailWhere(
  slug: string,
  now: Date = new Date(),
): Prisma.JobPostWhereInput {
  return {
    AND: [publishedJobsFilter(now), { slug }],
  };
}
