import {
  AuditAction,
  EntityType,
  JobStatus,
  NewsStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import prisma from "@/lib/db/prisma";

type AuditDbClient = PrismaClient | Prisma.TransactionClient;

const EMPTY_META: Prisma.InputJsonObject = {};

export type WriteAuditLogInput = {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string | null;
  createdById: string;
  metaJson?: Prisma.InputJsonValue;
};

type CmsLifecycleAuditAction =
  | "CREATE"
  | "UPDATE"
  | "PUBLISH"
  | "SCHEDULE"
  | "DELETE";

type JobLifecycleAuditMetaByAction = {
  CREATE: {
    title: string;
    slug: string;
    status: JobStatus;
  };
  UPDATE: {
    fields: string[];
    fromStatus: JobStatus;
    toStatus: JobStatus;
  };
  PUBLISH: {
    fromStatus: JobStatus;
    toStatus: JobStatus;
    publishAt: string | null;
  };
  SCHEDULE: {
    fromStatus: JobStatus;
    toStatus: JobStatus;
    scheduledAt: string | null;
  };
  DELETE: {
    fromStatus: JobStatus;
    deletedAt: string;
    title?: string;
    slug?: string;
  };
};

type NewsLifecycleAuditMetaByAction = {
  CREATE: {
    title: string;
    slug: string;
    status: NewsStatus;
  };
  UPDATE: {
    fields: string[];
    fromStatus: NewsStatus;
    toStatus: NewsStatus;
  };
  PUBLISH: {
    fromStatus: NewsStatus;
    toStatus: NewsStatus;
    publishAt: string | null;
  };
  SCHEDULE: {
    fromStatus: NewsStatus;
    toStatus: NewsStatus;
    scheduledAt: string | null;
  };
  DELETE: {
    fromStatus: NewsStatus;
    deletedAt: string;
    title?: string;
    slug?: string;
  };
};

export type WriteJobLifecycleAuditInput<
  TAction extends CmsLifecycleAuditAction,
> = {
  entityId?: string | null;
  createdById: string;
  metaJson: JobLifecycleAuditMetaByAction[TAction];
};

export type WriteNewsLifecycleAuditInput<
  TAction extends CmsLifecycleAuditAction,
> = {
  entityId?: string | null;
  createdById: string;
  metaJson: NewsLifecycleAuditMetaByAction[TAction];
};

export async function writeAuditLog(
  input: WriteAuditLogInput,
  db: AuditDbClient = prisma,
) {
  return db.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      createdById: input.createdById,
      metaJson: input.metaJson ?? EMPTY_META,
    },
  });
}

export async function writeAuditLogSafe(
  input: WriteAuditLogInput,
  db: AuditDbClient = prisma,
): Promise<boolean> {
  try {
    await writeAuditLog(input, db);
    return true;
  } catch (error) {
    console.error("Failed to write audit log", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      createdById: input.createdById,
      error,
    });
    return false;
  }
}

function writeJobLifecycleAuditLog<TAction extends CmsLifecycleAuditAction>(
  action: TAction,
  input: WriteJobLifecycleAuditInput<TAction>,
  db: AuditDbClient = prisma,
) {
  return writeAuditLog(
    {
      ...input,
      action,
      entityType: EntityType.JOB,
    },
    db,
  );
}

function writeNewsLifecycleAuditLog<TAction extends CmsLifecycleAuditAction>(
  action: TAction,
  input: WriteNewsLifecycleAuditInput<TAction>,
  db: AuditDbClient = prisma,
) {
  return writeAuditLog(
    {
      ...input,
      action,
      entityType: EntityType.NEWS,
    },
    db,
  );
}

export function writeJobCreateAuditLog(
  input: WriteJobLifecycleAuditInput<"CREATE">,
  db: AuditDbClient = prisma,
) {
  return writeJobLifecycleAuditLog("CREATE", input, db);
}

export function writeJobUpdateAuditLog(
  input: WriteJobLifecycleAuditInput<"UPDATE">,
  db: AuditDbClient = prisma,
) {
  return writeJobLifecycleAuditLog("UPDATE", input, db);
}

export function writeJobPublishAuditLog(
  input: WriteJobLifecycleAuditInput<"PUBLISH">,
  db: AuditDbClient = prisma,
) {
  return writeJobLifecycleAuditLog("PUBLISH", input, db);
}

export function writeJobScheduleAuditLog(
  input: WriteJobLifecycleAuditInput<"SCHEDULE">,
  db: AuditDbClient = prisma,
) {
  return writeJobLifecycleAuditLog("SCHEDULE", input, db);
}

export function writeJobDeleteAuditLog(
  input: WriteJobLifecycleAuditInput<"DELETE">,
  db: AuditDbClient = prisma,
) {
  return writeJobLifecycleAuditLog("DELETE", input, db);
}

export function writeNewsCreateAuditLog(
  input: WriteNewsLifecycleAuditInput<"CREATE">,
  db: AuditDbClient = prisma,
) {
  return writeNewsLifecycleAuditLog("CREATE", input, db);
}

export function writeNewsUpdateAuditLog(
  input: WriteNewsLifecycleAuditInput<"UPDATE">,
  db: AuditDbClient = prisma,
) {
  return writeNewsLifecycleAuditLog("UPDATE", input, db);
}

export function writeNewsPublishAuditLog(
  input: WriteNewsLifecycleAuditInput<"PUBLISH">,
  db: AuditDbClient = prisma,
) {
  return writeNewsLifecycleAuditLog("PUBLISH", input, db);
}

export function writeNewsScheduleAuditLog(
  input: WriteNewsLifecycleAuditInput<"SCHEDULE">,
  db: AuditDbClient = prisma,
) {
  return writeNewsLifecycleAuditLog("SCHEDULE", input, db);
}

export function writeNewsDeleteAuditLog(
  input: WriteNewsLifecycleAuditInput<"DELETE">,
  db: AuditDbClient = prisma,
) {
  return writeNewsLifecycleAuditLog("DELETE", input, db);
}

export { AuditAction, EntityType };
