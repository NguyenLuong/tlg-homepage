import "server-only";

import { Prisma } from "@prisma/client";

import prisma from "@/lib/db/prisma";

import type { DbClient } from "./jobs";

// ── News Categories ────────────────────────────────────────

const publicNewsCategorySelect = Prisma.validator<Prisma.NewsCategorySelect>()({
  id: true,
  nameVN: true,
  nameJA: true,
  slug: true,
});

const adminNewsCategorySelect = Prisma.validator<Prisma.NewsCategorySelect>()({
  id: true,
  nameVN: true,
});

export type PublicNewsCategory = Prisma.NewsCategoryGetPayload<{
  select: typeof publicNewsCategorySelect;
}>;

export type AdminNewsCategory = Prisma.NewsCategoryGetPayload<{
  select: typeof adminNewsCategorySelect;
}>;

/** News categories for the public news filter. */
export async function findPublicNewsCategories(
  db: DbClient = prisma,
): Promise<PublicNewsCategory[]> {
  return db.newsCategory.findMany({
    orderBy: { nameVN: "asc" },
    select: publicNewsCategorySelect,
  });
}

/** News categories for admin dropdowns. */
export async function findAdminNewsCategories(
  db: DbClient = prisma,
): Promise<AdminNewsCategory[]> {
  return db.newsCategory.findMany({
    select: adminNewsCategorySelect,
    orderBy: [{ nameVN: "asc" }],
  });
}

// ── Prefectures ────────────────────────────────────────────

const publicPrefectureSelect = Prisma.validator<Prisma.PrefectureSelect>()({
  id: true,
  code: true,
  nameJP: true,
  nameVN: true,
});

const adminPrefectureSelect = Prisma.validator<Prisma.PrefectureSelect>()({
  id: true,
  nameJP: true,
  nameVN: true,
  code: true,
});

export type PublicPrefecture = Prisma.PrefectureGetPayload<{
  select: typeof publicPrefectureSelect;
}>;

export type AdminPrefecture = Prisma.PrefectureGetPayload<{
  select: typeof adminPrefectureSelect;
}>;

/** Prefectures for the public jobs filter. */
export async function findPublicPrefectures(
  db: DbClient = prisma,
): Promise<PublicPrefecture[]> {
  return db.prefecture.findMany({
    orderBy: { code: "asc" },
    select: publicPrefectureSelect,
  });
}

/** Prefectures for admin dropdowns. */
export async function findAdminPrefectures(
  db: DbClient = prisma,
): Promise<AdminPrefecture[]> {
  return db.prefecture.findMany({
    select: adminPrefectureSelect,
    orderBy: [{ code: "asc" }],
  });
}
