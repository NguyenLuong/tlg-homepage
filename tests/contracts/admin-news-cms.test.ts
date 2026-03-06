import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminNewsCreatePayloadFixture,
  createAdminNewsUpdatePayloadFixture,
} from "@/tests/fixtures/public-content";

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

const NEWS_ID = "22222222-2222-4222-8222-222222222222";

function createBaseNews(overrides: Record<string, unknown> = {}) {
  return {
    id: NEWS_ID,
    title: "Thong bao lich nghi Tet",
    slug: "thong-bao-lich-nghi-tet",
    status: "DRAFT",
    publishAt: null,
    scheduledAt: null,
    updatedAt: new Date("2026-02-11T08:00:00.000Z"),
    contentRich: { type: "doc", content: [] },
    categoryId: "99999999-9999-4999-8999-999999999999",
    category: {
      id: "99999999-9999-4999-8999-999999999999",
      nameVN: "Company News",
      slug: "company-news",
      iconKey: "news",
    },
    ...overrides,
  };
}

function createPrismaP2025Error() {
  return {
    name: "PrismaClientKnownRequestError" as const,
    code: "P2025",
  };
}

describe("Admin CMS News Contract: /api/admin/news", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with { data: { items } } for list requests", async () => {
    prismaMock.newsPost.findMany.mockResolvedValueOnce([
      createBaseNews({
        publishAt: new Date("2026-02-10T08:00:00.000Z"),
      }),
    ]);

    const response = await listAdminNews(
      {} as Parameters<typeof listAdminNews>[0],
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          items: expect.any(Array),
        }),
      }),
    );
    expect(body.data.items[0]).toEqual(
      expect.objectContaining({
        id: NEWS_ID,
        title: "Thong bao lich nghi Tet",
        slug: "thong-bao-lich-nghi-tet",
        status: "DRAFT",
        updatedAt: expect.any(String),
      }),
    );
  });

  it("returns 401 envelope for unauthorized list requests", async () => {
    mockCmsAuthUnauthorized("Authentication is required.");

    const response = await listAdminNews(
      {} as Parameters<typeof listAdminNews>[0],
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        }),
      }),
    );
  });

  it("returns 201 with { data } for create payloads", async () => {
    const payload = createAdminNewsCreatePayloadFixture();

    prismaMock.newsPost.findMany.mockResolvedValueOnce([]);
    txMock.newsPost.create.mockResolvedValueOnce(createBaseNews());

    const response = await createAdminNews({
      json: vi.fn().mockResolvedValue(payload),
    } as unknown as Parameters<typeof createAdminNews>[0]);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: NEWS_ID,
          title: "Thong bao lich nghi Tet",
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
          title: "Thong bao lich nghi Tet",
          slug: "thong-bao-lich-nghi-tet",
          status: "DRAFT",
        }),
      }),
      txMock,
    );
  });

  it("returns 422 when create payload attempts to set lifecycle fields", async () => {
    const payload = {
      ...createAdminNewsCreatePayloadFixture(),
      status: "PUBLISHED",
    };

    const response = await createAdminNews({
      json: vi.fn().mockResolvedValue(payload),
    } as unknown as Parameters<typeof createAdminNews>[0]);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "UNPROCESSABLE_ENTITY",
          message: expect.stringContaining("status"),
        }),
      }),
    );
    expect(txMock.newsPost.create).not.toHaveBeenCalled();
    expect(writeNewsCreateAuditLogMock).not.toHaveBeenCalled();
  });
});

describe("Admin CMS News Contract: /api/admin/news/{id}", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with { data } for update payloads", async () => {
    const payload = createAdminNewsUpdatePayloadFixture({
      title: "Thong bao lich nghi Tet (Cap nhat)",
    });

    prismaMock.newsPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseNews(),
    );
    prismaMock.newsPost.findMany.mockResolvedValueOnce([]);
    txMock.newsPost.findUniqueOrThrow.mockResolvedValueOnce(createBaseNews());
    txMock.newsPost.update.mockResolvedValueOnce(
      createBaseNews({
        title: "Thong bao lich nghi Tet (Cap nhat)",
      }),
    );

    const response = await adminNewsByIdRoute.PATCH(
      {
        json: vi.fn().mockResolvedValue(payload),
      } as unknown as Parameters<typeof adminNewsByIdRoute.PATCH>[0],
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: NEWS_ID,
          title: "Thong bao lich nghi Tet (Cap nhat)",
          status: "DRAFT",
        }),
      }),
    );
    expect(writeRevisionSnapshotMock).toHaveBeenCalledTimes(1);
    expect(writeNewsUpdateAuditLogMock).toHaveBeenCalledTimes(1);
  });

  it("returns 422 envelope for invalid UUID path id", async () => {
    const response = await adminNewsByIdRoute.PATCH(
      {
        json: vi.fn().mockResolvedValue({ title: "patched-title" }),
      } as unknown as Parameters<typeof adminNewsByIdRoute.PATCH>[0],
      {
        params: Promise.resolve({ id: "invalid-id" }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "UNPROCESSABLE_ENTITY",
          message: expect.stringContaining("id"),
        }),
      }),
    );
  });

  it("exports DELETE handler for delete-confirmation contract coverage", () => {
    expect(typeof adminNewsByIdRoute.DELETE).toBe("function");
  });
});

describe("POST /api/admin/news/{id}/publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with { data } when transition is valid", async () => {
    txMock.newsPost.findUniqueOrThrow.mockResolvedValueOnce(createBaseNews());
    txMock.newsPost.update.mockResolvedValueOnce(
      createBaseNews({
        status: "PUBLISHED",
        publishAt: new Date("2026-02-11T09:30:00.000Z"),
      }),
    );

    const response = await publishNews(
      {} as Parameters<typeof publishNews>[0],
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: NEWS_ID,
          status: "PUBLISHED",
          publishAt: expect.any(String),
          scheduledAt: null,
        }),
      }),
    );
  });

  it("returns 409 error envelope for already-published publish transition", async () => {
    txMock.newsPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseNews({
        status: "PUBLISHED",
        publishAt: new Date("2026-02-11T09:00:00.000Z"),
      }),
    );

    const response = await publishNews(
      {} as Parameters<typeof publishNews>[0],
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "CONFLICT",
          message: expect.any(String),
        }),
      }),
    );
    expect(txMock.newsPost.update).not.toHaveBeenCalled();
  });

  it("returns 409 error envelope for archived-news publish transition", async () => {
    txMock.newsPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseNews({
        status: "ARCHIVED",
      }),
    );

    const response = await publishNews(
      {} as Parameters<typeof publishNews>[0],
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "CONFLICT",
          message: expect.any(String),
        }),
      }),
    );
  });

  it("returns 404 error envelope when news is missing", async () => {
    txMock.newsPost.findUniqueOrThrow.mockRejectedValueOnce(
      createPrismaP2025Error(),
    );

    const response = await publishNews(
      {} as Parameters<typeof publishNews>[0],
      {
        params: Promise.resolve({ id: NEWS_ID }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "NOT_FOUND",
          message: expect.any(String),
        }),
      }),
    );
  });
});

describe("POST /api/admin/news/{id}/schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with { data } when scheduling in the future", async () => {
    txMock.newsPost.findUniqueOrThrow.mockResolvedValueOnce(createBaseNews());
    txMock.newsPost.update.mockResolvedValueOnce(
      createBaseNews({
        status: "SCHEDULED",
        publishAt: null,
        scheduledAt: new Date("2028-01-01T00:00:00.000Z"),
      }),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2028-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleNews>[0];

    const response = await scheduleNews(request, {
      params: Promise.resolve({ id: NEWS_ID }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: NEWS_ID,
          status: "SCHEDULED",
          scheduledAt: expect.any(String),
          publishAt: null,
        }),
      }),
    );
  });

  it("returns 422 error envelope when scheduledAt is not future", async () => {
    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2020-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleNews>[0];

    const response = await scheduleNews(request, {
      params: Promise.resolve({ id: NEWS_ID }),
    });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "UNPROCESSABLE_ENTITY",
          message: expect.any(String),
          details: expect.objectContaining({
            field: "scheduledAt",
          }),
        }),
      }),
    );
  });

  it("returns 409 error envelope for published-news schedule transition", async () => {
    txMock.newsPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseNews({
        status: "PUBLISHED",
        publishAt: new Date("2026-02-11T09:00:00.000Z"),
      }),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2028-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleNews>[0];

    const response = await scheduleNews(request, {
      params: Promise.resolve({ id: NEWS_ID }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "CONFLICT",
          message: expect.any(String),
        }),
      }),
    );
  });

  it("returns 409 error envelope for archived-news schedule transition", async () => {
    txMock.newsPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseNews({
        status: "ARCHIVED",
      }),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2028-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleNews>[0];

    const response = await scheduleNews(request, {
      params: Promise.resolve({ id: NEWS_ID }),
    });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "CONFLICT",
          message: expect.any(String),
        }),
      }),
    );
  });

  it("returns 404 error envelope when news is missing", async () => {
    txMock.newsPost.findUniqueOrThrow.mockRejectedValueOnce(
      createPrismaP2025Error(),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2028-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleNews>[0];

    const response = await scheduleNews(request, {
      params: Promise.resolve({ id: NEWS_ID }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "NOT_FOUND",
          message: expect.any(String),
        }),
      }),
    );
  });
});
