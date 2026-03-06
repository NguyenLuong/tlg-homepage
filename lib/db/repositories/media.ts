import "server-only";

import { Prisma } from "@prisma/client";

import prisma from "@/lib/db/prisma";

import type { DbClient } from "./jobs";

// ── Select shapes ──────────────────────────────────────────

const mediaAssetAdminSelect = Prisma.validator<Prisma.MediaAssetSelect>()({
  id: true,
  url: true,
  publicId: true,
  altText: true,
  width: true,
  height: true,
  bytes: true,
  mime: true,
  createdAt: true,
});

const mediaAssetImageSelect = Prisma.validator<Prisma.MediaAssetSelect>()({
  url: true,
  altText: true,
  width: true,
  height: true,
});

// ── Derived types ──────────────────────────────────────────

export type MediaAssetAdmin = Prisma.MediaAssetGetPayload<{
  select: typeof mediaAssetAdminSelect;
}>;

export type MediaAssetImage = Prisma.MediaAssetGetPayload<{
  select: typeof mediaAssetImageSelect;
}>;

// ── Queries ────────────────────────────────────────────────

/** List recent media assets for admin media picker. */
export async function findRecentMediaAssets(
  limit: number = 50,
  db: DbClient = prisma,
): Promise<MediaAssetAdmin[]> {
  return db.mediaAsset.findMany({
    select: mediaAssetAdminSelect,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

/** Find a single media asset by ID (image fields only). */
export async function findMediaAssetImage(
  id: string,
  db: DbClient = prisma,
): Promise<MediaAssetImage | null> {
  return db.mediaAsset.findUnique({
    where: { id },
    select: mediaAssetImageSelect,
  });
}

// ── Mutations ──────────────────────────────────────────────

/** Create a media asset record. */
export async function createMediaAsset(
  data: Prisma.MediaAssetUncheckedCreateInput,
  db: DbClient = prisma,
) {
  return db.mediaAsset.create({ data });
}

/** Find a media asset by ID (admin fields). */
export async function findMediaAssetById(
  id: string,
  db: DbClient = prisma,
): Promise<MediaAssetAdmin | null> {
  return db.mediaAsset.findUnique({
    where: { id },
    select: mediaAssetAdminSelect,
  });
}

/**
 * Delete a media asset by ID.
 *
 * Because all FK relations use `onDelete: SetNull`, referencing
 * NewsPost / JobPost rows will have their image FK set to `null`
 * automatically by the database.
 */
export async function deleteMediaAsset(
  id: string,
  db: DbClient = prisma,
): Promise<void> {
  await db.mediaAsset.delete({ where: { id } });
}
