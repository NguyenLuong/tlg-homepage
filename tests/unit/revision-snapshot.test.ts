import { EntityType, Prisma, PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  default: {},
}));

import {
  runAtomicRevisionMutation,
  serializeRevisionSnapshot,
  writeRevisionSnapshotFromMutation,
} from "@/lib/revision/snapshot";

function createRevisionTxMock() {
  const create = vi.fn().mockResolvedValue({
    id: "rev-1",
  });

  const tx = {
    revision: {
      create,
    },
  } as unknown as Prisma.TransactionClient;

  return {
    tx,
    create,
  };
}

describe("serializeRevisionSnapshot", () => {
  it("normalizes mutation snapshots into JSON-safe values", () => {
    const publishedAt = new Date("2026-02-11T08:30:00.000Z");

    expect(
      serializeRevisionSnapshot({
        id: "job-1",
        status: "DRAFT",
        publishedAt,
        omitted: undefined,
      }),
    ).toEqual({
      id: "job-1",
      status: "DRAFT",
      publishedAt: "2026-02-11T08:30:00.000Z",
    });
  });
});

describe("writeRevisionSnapshotFromMutation", () => {
  it("writes serialized pre-mutation state into revision snapshots", async () => {
    const { tx, create } = createRevisionTxMock();

    await writeRevisionSnapshotFromMutation(
      {
        entityType: EntityType.NEWS,
        entityId: "00000000-0000-4000-8000-000000000777",
        createdById: "00000000-0000-4000-8000-000000000001",
        snapshotSource: {
          id: "00000000-0000-4000-8000-000000000777",
          status: "DRAFT",
          updatedAt: new Date("2026-02-11T09:00:00.000Z"),
        },
      },
      tx,
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        entityType: EntityType.NEWS,
        entityId: "00000000-0000-4000-8000-000000000777",
        createdById: "00000000-0000-4000-8000-000000000001",
        snapshotJson: {
          id: "00000000-0000-4000-8000-000000000777",
          status: "DRAFT",
          updatedAt: "2026-02-11T09:00:00.000Z",
        },
      },
    });
  });
});

describe("runAtomicRevisionMutation", () => {
  it("opens a transaction when a Prisma client is provided", async () => {
    const { tx, create } = createRevisionTxMock();
    const transaction = vi.fn(async (runner: (tx: Prisma.TransactionClient) => unknown) =>
      runner(tx),
    );

    const db = {
      $transaction: transaction,
    } as unknown as PrismaClient;

    const readBefore = vi.fn(async () => ({
      id: "00000000-0000-4000-8000-000000000123",
      status: "DRAFT",
      updatedAt: new Date("2026-02-11T10:00:00.000Z"),
    }));

    const mutate = vi.fn(async (_tx: Prisma.TransactionClient, before: { id: string }) => ({
      id: before.id,
      status: "PUBLISHED",
    }));

    const outcome = await runAtomicRevisionMutation(
      {
        entityType: EntityType.JOB,
        createdById: "00000000-0000-4000-8000-000000000001",
        readBefore,
        mutate,
        resolveEntityId: (before) => before.id,
      },
      db,
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(readBefore).toHaveBeenCalledWith(tx);
    expect(mutate).toHaveBeenCalledWith(tx, outcome.before);
    expect(create).toHaveBeenCalledTimes(1);
    expect(outcome.before).toMatchObject({
      id: "00000000-0000-4000-8000-000000000123",
      status: "DRAFT",
    });
    expect(outcome.result).toEqual({
      id: "00000000-0000-4000-8000-000000000123",
      status: "PUBLISHED",
    });
  });

  it("reuses the provided transaction client without nesting", async () => {
    const { tx, create } = createRevisionTxMock();

    const readBefore = vi.fn(async () => ({
      id: "00000000-0000-4000-8000-000000000222",
      status: "SCHEDULED",
    }));

    const mutate = vi.fn(async (currentTx: Prisma.TransactionClient, before: { id: string }) => {
      expect(currentTx).toBe(tx);
      return {
        id: before.id,
        status: "PUBLISHED",
      };
    });

    const outcome = await runAtomicRevisionMutation(
      {
        entityType: EntityType.NEWS,
        createdById: "00000000-0000-4000-8000-000000000001",
        readBefore,
        mutate,
        resolveEntityId: (before, result) => {
          expect(result.id).toBe(before.id);
          return before.id;
        },
      },
      tx,
    );

    expect(readBefore).toHaveBeenCalledWith(tx);
    expect(mutate).toHaveBeenCalledWith(tx, outcome.before);
    expect(create).toHaveBeenCalledTimes(1);
    expect(outcome.result.status).toBe("PUBLISHED");
  });
});
