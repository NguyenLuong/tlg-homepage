import { EntityType, Prisma, PrismaClient } from "@prisma/client";

import prisma from "@/lib/db/prisma";

type RevisionDbClient = PrismaClient | Prisma.TransactionClient;
type RevisionMutationClient = Prisma.TransactionClient;

function canStartTransaction(db: RevisionDbClient): db is PrismaClient {
  return "$transaction" in db && typeof db.$transaction === "function";
}

export type WriteRevisionSnapshotInput = {
  entityType: EntityType;
  entityId: string;
  createdById: string;
  snapshotJson: Prisma.InputJsonValue;
};

export type WriteRevisionSnapshotFromMutationInput = Omit<
  WriteRevisionSnapshotInput,
  "snapshotJson"
> & {
  snapshotSource: unknown;
};

export type RunAtomicRevisionMutationInput<TBefore, TResult> = {
  entityType: EntityType;
  createdById: string;
  readBefore: (tx: RevisionMutationClient) => Promise<TBefore>;
  mutate: (tx: RevisionMutationClient, before: TBefore) => Promise<TResult>;
  resolveEntityId: (before: TBefore, result: TResult) => string;
};

export type RunAtomicRevisionMutationResult<TBefore, TResult> = {
  before: TBefore;
  result: TResult;
};

export function serializeRevisionSnapshot(source: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(source)) as Prisma.InputJsonValue;
}

export async function writeRevisionSnapshot(
  input: WriteRevisionSnapshotInput,
  db: RevisionDbClient = prisma,
) {
  return db.revision.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      createdById: input.createdById,
      snapshotJson: input.snapshotJson,
    },
  });
}

export async function writeRevisionSnapshotFromMutation(
  input: WriteRevisionSnapshotFromMutationInput,
  db: RevisionDbClient = prisma,
) {
  return writeRevisionSnapshot(
    {
      entityType: input.entityType,
      entityId: input.entityId,
      createdById: input.createdById,
      snapshotJson: serializeRevisionSnapshot(input.snapshotSource),
    },
    db,
  );
}

async function runAtomicRevisionMutationWithTx<TBefore, TResult>(
  input: RunAtomicRevisionMutationInput<TBefore, TResult>,
  tx: RevisionMutationClient,
): Promise<RunAtomicRevisionMutationResult<TBefore, TResult>> {
  const before = await input.readBefore(tx);
  const result = await input.mutate(tx, before);

  await writeRevisionSnapshotFromMutation(
    {
      entityType: input.entityType,
      entityId: input.resolveEntityId(before, result),
      createdById: input.createdById,
      snapshotSource: before,
    },
    tx,
  );

  return { before, result };
}

export async function runAtomicRevisionMutation<TBefore, TResult>(
  input: RunAtomicRevisionMutationInput<TBefore, TResult>,
  db: RevisionDbClient = prisma,
): Promise<RunAtomicRevisionMutationResult<TBefore, TResult>> {
  if (canStartTransaction(db)) {
    return db.$transaction((tx) => runAtomicRevisionMutationWithTx(input, tx));
  }

  return runAtomicRevisionMutationWithTx(input, db);
}

export async function writeRevisionSnapshotSafe(
  input: WriteRevisionSnapshotInput,
  db: RevisionDbClient = prisma,
): Promise<boolean> {
  try {
    await writeRevisionSnapshot(input, db);
    return true;
  } catch (error) {
    console.error("Failed to write revision snapshot", {
      entityType: input.entityType,
      entityId: input.entityId,
      createdById: input.createdById,
      error,
    });
    return false;
  }
}

export { EntityType };
