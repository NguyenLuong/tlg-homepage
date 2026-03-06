import "server-only";

import { type AuditAction, type EntityType, Prisma } from "@prisma/client";

import prisma from "@/lib/db/prisma";

import type { DbClient } from "./jobs";

// ── Select shapes ──────────────────────────────────────────

const auditLogSelect = Prisma.validator<Prisma.AuditLogSelect>()({
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  metaJson: true,
  createdAt: true,
  createdBy: {
    select: { id: true, name: true, email: true, role: true },
  },
});

const revisionSelect = Prisma.validator<Prisma.RevisionSelect>()({
  id: true,
  entityType: true,
  entityId: true,
  snapshotJson: true,
  createdAt: true,
  createdBy: {
    select: { id: true, name: true, email: true, role: true },
  },
});

// ── Derived types ──────────────────────────────────────────

export type AuditLogItem = Prisma.AuditLogGetPayload<{
  select: typeof auditLogSelect;
}>;

export type RevisionItem = Prisma.RevisionGetPayload<{
  select: typeof revisionSelect;
}>;

// ── Queries ────────────────────────────────────────────────

export type AuditLogFilters = {
  entityType?: EntityType;
  action?: AuditAction;
  entityId?: string;
  limit?: number;
};

/** Find audit logs with optional filters. */
export async function findAuditLogs(
  filters: AuditLogFilters = {},
  db: DbClient = prisma,
): Promise<AuditLogItem[]> {
  const { entityType, action, entityId, limit = 50 } = filters;

  return db.auditLog.findMany({
    where: {
      ...(entityType ? { entityType } : {}),
      ...(action ? { action } : {}),
      ...(entityId ? { entityId } : {}),
    },
    select: auditLogSelect,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

export type RevisionFilters = {
  entityType?: EntityType;
  entityId?: string;
  limit?: number;
};

/** Find revisions with optional filters. */
export async function findRevisions(
  filters: RevisionFilters = {},
  db: DbClient = prisma,
): Promise<RevisionItem[]> {
  const { entityType, entityId, limit = 50 } = filters;

  return db.revision.findMany({
    where: {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
    },
    select: revisionSelect,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

/** Find audit logs and revisions together. */
export async function findAuditLogsAndRevisions(
  filters: AuditLogFilters & RevisionFilters,
  db: DbClient = prisma,
): Promise<{ auditLogs: AuditLogItem[]; revisions: RevisionItem[] }> {
  const [auditLogs, revisions] = await Promise.all([
    findAuditLogs(filters, db),
    findRevisions(filters, db),
  ]);

  return { auditLogs, revisions };
}
