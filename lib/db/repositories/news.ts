import "server-only";

import { NewsStatus, Prisma } from "@prisma/client";

import prisma from "@/lib/db/prisma";
import {
  publishedNewsDetailWhere,
  publishedNewsFilter,
} from "@/lib/public-content/published-filters";

import type { DbClient } from "./jobs";

// ── Select shapes ──────────────────────────────────────────

export const publicNewsCardSelect = Prisma.validator<Prisma.NewsPostSelect>()({
  id: true,
  title: true,
  slug: true,
  publishAt: true,
  category: {
    select: {
      nameVN: true,
      nameJA: true,
      slug: true,
    },
  },
});

export const publicNewsDetailSelect = Prisma.validator<Prisma.NewsPostSelect>()(
  {
    id: true,
    title: true,
    slug: true,
    contentRich: true,
    publishAt: true,
    updatedAt: true,
    category: {
      select: { nameVN: true, nameJA: true, slug: true },
    },
  },
);

export const newsOgImageSelect = Prisma.validator<Prisma.NewsPostSelect>()({
  title: true,
  contentRich: true,
  publishAt: true,
  category: { select: { nameVN: true } },
});

export const newsSitemapSelect = Prisma.validator<Prisma.NewsPostSelect>()({
  slug: true,
  updatedAt: true,
  publishAt: true,
});

export const newsHeadlineSelect = Prisma.validator<Prisma.NewsPostSelect>()({
  id: true,
  title: true,
  slug: true,
  category: true,
  publishAt: true,
});

const newsCategorySelect = Prisma.validator<Prisma.NewsCategorySelect>()({
  id: true,
  nameVN: true,
  slug: true,
  iconKey: true,
});

export const adminNewsSummarySelect = Prisma.validator<Prisma.NewsPostSelect>()(
  {
    id: true,
    title: true,
    slug: true,
    status: true,
    publishAt: true,
    scheduledAt: true,
    updatedAt: true,
    category: { select: newsCategorySelect },
  },
);

export const adminNewsDetailSelect = Prisma.validator<Prisma.NewsPostSelect>()({
  id: true,
  title: true,
  slug: true,
  contentRich: true,
  categoryId: true,
  status: true,
  publishAt: true,
  scheduledAt: true,
  updatedAt: true,
  category: { select: newsCategorySelect },
});

/** Select used by admin news page component (RSC). */
export const adminNewsPageSelect = Prisma.validator<Prisma.NewsPostSelect>()({
  id: true,
  title: true,
  slug: true,
  status: true,
  publishAt: true,
  scheduledAt: true,
  updatedAt: true,
  category: { select: { nameVN: true } },
});

/** Select used by admin news editor page. */
export const adminNewsEditorSelect = Prisma.validator<Prisma.NewsPostSelect>()({
  id: true,
  title: true,
  slug: true,
  contentRich: true,
  categoryId: true,
  status: true,
  updatedAt: true,
  publishAt: true,
});

// ── Derived types ──────────────────────────────────────────

export type PublicNewsCard = Prisma.NewsPostGetPayload<{
  select: typeof publicNewsCardSelect;
}>;

export type PublicNewsDetail = Prisma.NewsPostGetPayload<{
  select: typeof publicNewsDetailSelect;
}>;

export type NewsOgImage = Prisma.NewsPostGetPayload<{
  select: typeof newsOgImageSelect;
}>;

export type NewsSitemapEntry = Prisma.NewsPostGetPayload<{
  select: typeof newsSitemapSelect;
}>;

export type NewsHeadline = Prisma.NewsPostGetPayload<{
  select: typeof newsHeadlineSelect;
}>;

export type AdminNewsSummary = Prisma.NewsPostGetPayload<{
  select: typeof adminNewsSummarySelect;
}>;

export type AdminNewsDetail = Prisma.NewsPostGetPayload<{
  select: typeof adminNewsDetailSelect;
}>;

export type AdminNewsPageItem = Prisma.NewsPostGetPayload<{
  select: typeof adminNewsPageSelect;
}>;

export type AdminNewsEditorItem = Prisma.NewsPostGetPayload<{
  select: typeof adminNewsEditorSelect;
}>;

// ── Public read queries ────────────────────────────────────

/** Count + paginated list for the public news listing page. */
export async function findPublishedNewsPaginated(opts: {
  where: Prisma.NewsPostWhereInput;
  orderBy: Prisma.NewsPostOrderByWithRelationInput[];
  skip: number;
  take: number;
}): Promise<[total: number, news: PublicNewsCard[]]> {
  return prisma.$transaction([
    prisma.newsPost.count({ where: opts.where }),
    prisma.newsPost.findMany({
      where: opts.where,
      orderBy: opts.orderBy,
      skip: opts.skip,
      take: opts.take,
      select: publicNewsCardSelect,
    }),
  ]) as Promise<[number, PublicNewsCard[]]>;
}

/** Single published news post for the detail page. */
export async function findPublishedNewsDetail(
  where: Prisma.NewsPostWhereInput,
  db: DbClient = prisma,
): Promise<PublicNewsDetail | null> {
  return db.newsPost.findFirst({
    where,
    select: publicNewsDetailSelect,
  });
}

/** News data for Open Graph image rendering. */
export async function findPublishedNewsForOgImage(
  slug: string,
  db: DbClient = prisma,
): Promise<NewsOgImage | null> {
  return db.newsPost.findFirst({
    where: {
      slug,
      status: NewsStatus.PUBLISHED,
      OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
    },
    select: newsOgImageSelect,
  });
}

/** Published news for sitemap generation. */
export async function findPublishedNewsForSitemap(
  now?: Date,
  db: DbClient = prisma,
): Promise<NewsSitemapEntry[]> {
  return db.newsPost.findMany({
    where: publishedNewsFilter(now),
    select: newsSitemapSelect,
  });
}

/** News headlines for homepage. */
export async function findNewsHeadlines(
  limit: number = 4,
  db: DbClient = prisma,
): Promise<NewsHeadline[]> {
  return db.newsPost.findMany({
    where: publishedNewsFilter(),
    orderBy: [{ publishAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: newsHeadlineSelect,
  });
}

// ── Admin read queries ─────────────────────────────────────

/** Admin listing page (RSC). */
export async function findAdminNewsPageList(
  db: DbClient = prisma,
): Promise<AdminNewsPageItem[]> {
  return db.newsPost.findMany({
    select: adminNewsPageSelect,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

/** Admin API listing (richer payload). */
export async function findAdminNewsList(
  db: DbClient = prisma,
): Promise<AdminNewsSummary[]> {
  return db.newsPost.findMany({
    select: adminNewsSummarySelect,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

/** Admin news editor page. */
export async function findAdminNewsById(
  id: string,
  db: DbClient = prisma,
): Promise<AdminNewsEditorItem | null> {
  return db.newsPost.findUnique({
    where: { id },
    select: adminNewsEditorSelect,
  });
}

// ── Mutation helpers ───────────────────────────────────────

/** Pre-mutation existence check. */
export async function findNewsByIdOrThrow(id: string, db: DbClient = prisma) {
  return db.newsPost.findUniqueOrThrow({ where: { id } });
}

/** Create a news post and return admin detail shape. */
export async function createNews(
  data: Prisma.NewsPostUncheckedCreateInput,
  db: DbClient = prisma,
): Promise<AdminNewsDetail> {
  return db.newsPost.create({
    data,
    select: adminNewsDetailSelect,
  });
}

/** Update a news post with category relation included. */
export async function updateNews(
  id: string,
  data: Prisma.NewsPostUncheckedUpdateInput,
  db: DbClient = prisma,
) {
  return db.newsPost.update({
    where: { id },
    data,
    include: {
      category: {
        select: { id: true, nameVN: true, slug: true, iconKey: true },
      },
    },
  });
}

/** Delete a news post. */
export async function deleteNews(id: string, db: DbClient = prisma) {
  return db.newsPost.delete({ where: { id } });
}

/** Find scheduled news due for publishing. */
export async function findScheduledNewsDue(now: Date, db: DbClient = prisma) {
  return db.newsPost.findMany({
    where: {
      status: NewsStatus.SCHEDULED,
      scheduledAt: { lte: now },
    },
  });
}

/** Update news status (publish/schedule). */
export async function updateNewsStatus(
  id: string,
  data: Prisma.NewsPostUncheckedUpdateInput,
  db: DbClient = prisma,
) {
  return db.newsPost.update({
    where: { id },
    data,
    include: {
      category: {
        select: { id: true, nameVN: true, slug: true, iconKey: true },
      },
    },
  });
}

// ── Public API queries ─────────────────────────────────────

/** Public API listing with includes. */
export async function findPublishedNewsApiPaginated(opts: {
  where: Prisma.NewsPostWhereInput;
  orderBy: Prisma.NewsPostOrderByWithRelationInput[];
  skip: number;
  take: number;
}) {
  return prisma.$transaction([
    prisma.newsPost.count({ where: opts.where }),
    prisma.newsPost.findMany({
      where: opts.where,
      orderBy: opts.orderBy,
      skip: opts.skip,
      take: opts.take,
      include: {
        category: {
          select: { id: true, nameVN: true, slug: true, iconKey: true },
        },
      },
    }),
  ]);
}

/** Public API single news detail. */
export async function findPublishedNewsApiDetail(
  slug: string,
  db: DbClient = prisma,
) {
  return db.newsPost.findFirst({
    where: publishedNewsDetailWhere(slug),
    select: {
      id: true,
      slug: true,
      title: true,
      contentRich: true,
      publishAt: true,
      category: {
        select: { id: true, nameVN: true, slug: true, iconKey: true },
      },
    },
  });
}
