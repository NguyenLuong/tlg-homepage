import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminNewsCreatePayloadFixture,
  createAdminNewsUpdatePayloadFixture,
  createSchedulePayloadFixture,
} from "@/tests/fixtures/public-content";

const NEWS_ID = "22222222-2222-4222-8222-222222222222";

type NewsRecord = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishAt: Date | null;
  scheduledAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  contentRich: Record<string, unknown>;
  categoryId: string;
  createdById: string;
  updatedById: string;
};

const txMock = vi.hoisted(() => ({
  newsPost: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  newsPost: {
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  $transaction: vi.fn(
    async (callback: (tx: typeof txMock) => Promise<unknown>) =>
      callback(txMock),
  ),
}));

const writeRevisionSnapshotMock = vi.hoisted(() => vi.fn());
const writeNewsCreateAuditLogMock = vi.hoisted(() => vi.fn());
const writeNewsUpdateAuditLogMock = vi.hoisted(() => vi.fn());
const writeNewsPublishAuditLogMock = vi.hoisted(() => vi.fn());
const writeNewsScheduleAuditLogMock = vi.hoisted(() => vi.fn());
const writeNewsDeleteAuditLogMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

vi.mock("@/lib/revision/snapshot", () => ({
  writeRevisionSnapshot: writeRevisionSnapshotMock,
}));

vi.mock("@/lib/audit/log", () => ({
  writeNewsCreateAuditLog: writeNewsCreateAuditLogMock,
  writeNewsUpdateAuditLog: writeNewsUpdateAuditLogMock,
  writeNewsPublishAuditLog: writeNewsPublishAuditLogMock,
  writeNewsScheduleAuditLog: writeNewsScheduleAuditLogMock,
  writeNewsDeleteAuditLog: writeNewsDeleteAuditLogMock,
}));

import {
  GET as listAdminNews,
  POST as createAdminNews,
} from "@/app/api/admin/news/route";
import * as adminNewsByIdRoute from "@/app/api/admin/news/[id]/route";
import { POST as publishNews } from "@/app/api/admin/news/[id]/publish/route";
import { POST as scheduleNews } from "@/app/api/admin/news/[id]/schedule/route";

const CATEGORY = {
  id: "99999999-9999-4999-8999-999999999999",
  nameVN: "Company News",
  slug: "company-news",
  iconKey: "news",
};

function createRequestWithJson(payload: unknown) {
  return {
    json: vi.fn().mockResolvedValue(payload),
  };
}

function createDeleteRequest(confirm?: string) {
  const searchParams = new URLSearchParams();
  if (confirm !== undefined) {
    searchParams.set("confirm", confirm);
  }
  return {
    nextUrl: { searchParams },
    url: `https://example.test/api/admin/news/${NEWS_ID}?${searchParams.toString()}`,
  };
}

describe("Admin news CMS integration flow", () => {
  let newsPosts = new Map<string, NewsRecord>();

  function hydrate(record: NewsRecord) {
    return {
      ...record,
      contentRich: { ...record.contentRich },
      category: CATEGORY,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    newsPosts = new Map();

    prismaMock.newsPost.findMany.mockImplementation(async () =>
      [...newsPosts.values()].map((record) => hydrate(record)),
    );

    prismaMock.newsPost.findUniqueOrThrow.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const record = newsPosts.get(where.id);
        if (!record) {
          throw {
            name: "PrismaClientKnownRequestError" as const,
            code: "P2025",
          };
        }
        return hydrate(record);
      },
    );

    txMock.newsPost.create.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => {
        const created: NewsRecord = {
          id: NEWS_ID,
          title: data.title as string,
          slug: data.slug as string,
          status: (data.status as NewsRecord["status"]) ?? "DRAFT",
          publishAt: (data.publishAt as Date | null | undefined) ?? null,
          scheduledAt: (data.scheduledAt as Date | null | undefined) ?? null,
          updatedAt: new Date("2026-02-11T08:00:00.000Z"),
          createdAt: new Date("2026-02-11T08:00:00.000Z"),
          contentRich: (data.contentRich as Record<string, unknown>) ?? {
            type: "doc",
            content: [],
          },
          categoryId: data.categoryId as string,
          createdById: data.createdById as string,
          updatedById: data.updatedById as string,
        };
        newsPosts.set(NEWS_ID, created);
        return hydrate(created);
      },
    );

    txMock.newsPost.findUniqueOrThrow.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const record = newsPosts.get(where.id);
        if (!record) {
          throw {
            name: "PrismaClientKnownRequestError" as const,
            code: "P2025",
          };
        }
        return hydrate(record);
      },
    );

    txMock.newsPost.update.mockImplementation(
      async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<NewsRecord>;
      }) => {
        const existing = newsPosts.get(where.id);
        if (!existing) {
          throw {
            name: "PrismaClientKnownRequestError" as const,
            code: "P2025",
          };
        }

        const updated: NewsRecord = {
          ...existing,
          ...data,
          updatedAt: new Date("2026-02-11T08:30:00.000Z"),
        };
        newsPosts.set(where.id, updated);
        return hydrate(updated);
      },
    );

    txMock.newsPost.delete.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const existing = newsPosts.get(where.id);
        if (!existing) {
          throw {
            name: "PrismaClientKnownRequestError" as const,
            code: "P2025",
          };
        }
        newsPosts.delete(where.id);
        return existing;
      },
    );
  });

  it("supports create/list/update/schedule/publish/delete lifecycle with delete confirmation", async () => {
    const createPayload = createAdminNewsCreatePayloadFixture();

    const createResponse = await createAdminNews(
      createRequestWithJson(createPayload) as unknown as Parameters<
        typeof createAdminNews
      >[0],
    );
    const createBody = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(createBody).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: NEWS_ID,
          title: createPayload.title,
          status: "DRAFT",
        }),
      }),
    );
    expect(writeNewsCreateAuditLogMock).toHaveBeenCalledTimes(1);
    expect(writeNewsCreateAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: NEWS_ID,
        createdById: "00000000-0000-4000-8000-000000000001",
        metaJson: expect.objectContaining({
          title: createPayload.title,
          slug: expect.any(String),
          status: "DRAFT",
        }),
      }),
      txMock,
    );

    const listAfterCreateResponse = await listAdminNews(
      {} as unknown as Parameters<typeof listAdminNews>[0],
    );
    const listAfterCreateBody = await listAfterCreateResponse.json();

    expect(listAfterCreateResponse.status).toBe(200);
    expect(listAfterCreateBody.data.items).toHaveLength(1);
    expect(listAfterCreateBody.data.items[0]).toEqual(
      expect.objectContaining({
        id: NEWS_ID,
        title: createPayload.title,
      }),
    );

    const updatePayload = createAdminNewsUpdatePayloadFixture({
      title: "Thong bao lich nghi Tet (Cap nhat lan 2)",
    });

    const updateResponse = await adminNewsByIdRoute.PATCH(
      createRequestWithJson(updatePayload) as unknown as Parameters<
        typeof adminNewsByIdRoute.PATCH
      >[0],
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const updateBody = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updateBody).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: NEWS_ID,
          title: "Thong bao lich nghi Tet (Cap nhat lan 2)",
          status: "DRAFT",
        }),
      }),
    );
    expect(writeRevisionSnapshotMock).toHaveBeenCalledTimes(2);
    expect(writeNewsUpdateAuditLogMock).toHaveBeenCalledTimes(1);

    const scheduledAtIso = "2028-01-01T00:00:00.000Z";
    const scheduleResponse = await scheduleNews(
      createRequestWithJson(
        createSchedulePayloadFixture(scheduledAtIso),
      ) as unknown as Parameters<typeof scheduleNews>[0],
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const scheduleBody = await scheduleResponse.json();

    expect(scheduleResponse.status).toBe(200);
    expect(scheduleBody).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: NEWS_ID,
          status: "SCHEDULED",
          scheduledAt: scheduledAtIso,
          publishAt: null,
        }),
      }),
    );
    expect(writeRevisionSnapshotMock).toHaveBeenCalledTimes(3);
    expect(writeNewsScheduleAuditLogMock).toHaveBeenCalledTimes(1);

    const publishResponse = await publishNews(
      {} as unknown as Parameters<typeof publishNews>[0],
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const publishBody = await publishResponse.json();

    expect(publishResponse.status).toBe(200);
    expect(publishBody).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: NEWS_ID,
          status: "PUBLISHED",
          publishAt: expect.any(String),
          scheduledAt: null,
        }),
      }),
    );
    expect(writeRevisionSnapshotMock).toHaveBeenCalledTimes(4);
    expect(writeNewsPublishAuditLogMock).toHaveBeenCalledTimes(1);

    const deleteAdminNews = (
      adminNewsByIdRoute as unknown as {
        DELETE?: (
          request: unknown,
          context: { params: Promise<{ id: string }> },
        ) => Promise<Response>;
      }
    ).DELETE;

    if (!deleteAdminNews) {
      throw new Error(
        "DELETE handler is not implemented for /api/admin/news/[id].",
      );
    }

    const deleteWithoutConfirmResponse = await deleteAdminNews(
      createDeleteRequest("false"),
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const deleteWithoutConfirmBody = await deleteWithoutConfirmResponse.json();

    expect(deleteWithoutConfirmResponse.status).toBe(400);
    expect(deleteWithoutConfirmBody).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "BAD_REQUEST",
          message: expect.stringContaining("confirm"),
        }),
      }),
    );

    const deleteWithConfirmResponse = await deleteAdminNews(
      createDeleteRequest("true"),
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const deleteWithConfirmBody = await deleteWithConfirmResponse.json();

    expect(deleteWithConfirmResponse.status).toBe(200);
    expect(deleteWithConfirmBody).toEqual({
      data: {
        id: NEWS_ID,
        deleted: true,
      },
    });
    expect(writeRevisionSnapshotMock).toHaveBeenCalledTimes(5);
    expect(writeNewsDeleteAuditLogMock).toHaveBeenCalledTimes(1);
    expect(writeNewsDeleteAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: NEWS_ID,
        createdById: "00000000-0000-4000-8000-000000000001",
        metaJson: expect.objectContaining({
          fromStatus: "PUBLISHED",
          deletedAt: expect.any(String),
          title: "Thong bao lich nghi Tet (Cap nhat lan 2)",
          slug: expect.any(String),
        }),
      }),
      txMock,
    );

    const listAfterDeleteResponse = await listAdminNews(
      {} as unknown as Parameters<typeof listAdminNews>[0],
    );
    const listAfterDeleteBody = await listAfterDeleteResponse.json();

    expect(listAfterDeleteResponse.status).toBe(200);
    expect(listAfterDeleteBody).toEqual({
      data: {
        items: [],
      },
    });
  });
});
