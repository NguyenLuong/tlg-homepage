import "server-only";

import { Prisma, type UserRole } from "@prisma/client";

import prisma from "@/lib/db/prisma";

import type { DbClient } from "./jobs";

// ── Select shapes ──────────────────────────────────────────

const userProfileSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  role: true,
});

const userLoginSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  role: true,
  passwordHash: true,
});

// ── Derived types ──────────────────────────────────────────

export type UserProfile = Prisma.UserGetPayload<{
  select: typeof userProfileSelect;
}>;

export type UserLogin = Prisma.UserGetPayload<{
  select: typeof userLoginSelect;
}>;

// ── Queries ────────────────────────────────────────────────

/** Find user by ID (profile data, no password). */
export async function findUserById(
  id: string,
  db: DbClient = prisma,
): Promise<UserProfile | null> {
  return db.user.findUnique({
    where: { id },
    select: userProfileSelect,
  });
}

/** Find user by email (includes password hash for login). */
export async function findUserByEmail(
  email: string,
  db: DbClient = prisma,
): Promise<UserLogin | null> {
  return db.user.findUnique({
    where: { email },
    select: userLoginSelect,
  });
}

/** Update last login timestamp. */
export async function updateLastLogin(id: string, db: DbClient = prisma) {
  return db.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}
