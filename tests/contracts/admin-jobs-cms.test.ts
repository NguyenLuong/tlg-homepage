import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminJobCreatePayloadFixture,
  createAdminJobUpdatePayloadFixture,
} from "@/tests/fixtures/public-content";

const txMock = vi.hoisted(() => ({
  jobPost: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  jobPost: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(
    async (callback: (tx: typeof txMock) => Promise<unknown>) =>
      callback(txMock),
  ),
}));

const writeRevisionSnapshotMock = vi.hoisted(() => vi.fn());
const writeJobCreateAuditLogMock = vi.hoisted(() => vi.fn());
const writeJobUpdateAuditLogMock = vi.hoisted(() => vi.fn());
const writeJobPublishAuditLogMock = vi.hoisted(() => vi.fn());
const writeJobScheduleAuditLogMock = vi.hoisted(() => vi.fn());
const writeJobDeleteAuditLogMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/revision/snapshot", () => ({
  writeRevisionSnapshot: writeRevisionSnapshotMock,
}));

vi.mock("@/lib/audit/log", () => ({
  writeJobCreateAuditLog: writeJobCreateAuditLogMock,
  writeJobUpdateAuditLog: writeJobUpdateAuditLogMock,
  writeJobPublishAuditLog: writeJobPublishAuditLogMock,
  writeJobScheduleAuditLog: writeJobScheduleAuditLogMock,
  writeJobDeleteAuditLog: writeJobDeleteAuditLogMock,
}));

import {
  GET as listAdminJobs,
  POST as createAdminJob,
} from "@/app/api/admin/jobs/route";
import * as adminJobsByIdRoute from "@/app/api/admin/jobs/[id]/route";
import { POST as publishJob } from "@/app/api/admin/jobs/[id]/publish/route";
import { POST as scheduleJob } from "@/app/api/admin/jobs/[id]/schedule/route";

const JOB_ID = "11111111-1111-4111-8111-111111111111";

function resetDbMocks() {
  prismaMock.jobPost.findMany.mockReset();
  txMock.jobPost.create.mockReset();
  txMock.jobPost.findUniqueOrThrow.mockReset();
  txMock.jobPost.update.mockReset();
}

function createBaseJob(overrides: Record<string, unknown> = {}) {
  return {
    id: JOB_ID,
    title: "Senior Fullstack Engineer",
    slug: "senior-fullstack-engineer",
    status: "DRAFT",
    publishAt: null,
    scheduledAt: null,
    updatedAt: new Date("2026-02-11T08:00:00.000Z"),
    locationPrefectureId: "77777777-7777-4777-8777-777777777777",
    salaryText: "40 - 55 trieu",
    benefits: ["Bao hiem day du", "Lam viec hybrid", "Thuong thanh tich"],
    descriptionRich: { type: "doc", content: [] },
    requirementsRich: { type: "doc", content: [] },
    processRich: { type: "doc", content: [] },
    headcountText: "02",
    deadlineAt: null,
    employmentType: "FULL_TIME",
    heroImageId: null,
    prefecture: {
      id: "77777777-7777-4777-8777-777777777777",
      code: "tokyo",
      nameVN: "Tokyo",
      nameJP: "Tokyo",
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

describe("Admin CMS Jobs Contract: /api/admin/jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  it("returns 200 with { data: { items } } for list requests", async () => {
    prismaMock.jobPost.findMany.mockResolvedValueOnce([
      createBaseJob({
        publishAt: new Date("2026-02-10T08:00:00.000Z"),
      }),
    ]);

    const response = await listAdminJobs(
      {} as Parameters<typeof listAdminJobs>[0],
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
        id: JOB_ID,
        title: "Senior Fullstack Engineer",
        slug: "senior-fullstack-engineer",
        status: "DRAFT",
        updatedAt: expect.any(String),
      }),
    );
  });

  it("returns 401 envelope for unauthorized list requests", async () => {
    mockCmsAuthUnauthorized("Authentication is required.");

    const response = await listAdminJobs(
      {} as Parameters<typeof listAdminJobs>[0],
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
    const payload = createAdminJobCreatePayloadFixture();

    txMock.jobPost.create.mockResolvedValueOnce({
      id: JOB_ID,
    });
    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(createBaseJob());

    const response = await createAdminJob({
      json: vi.fn().mockResolvedValue(payload),
    } as unknown as Parameters<typeof createAdminJob>[0]);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
          title: "Senior Fullstack Engineer",
          status: "DRAFT",
        }),
      }),
    );
    expect(writeRevisionSnapshotMock).toHaveBeenCalledTimes(1);
    expect(writeRevisionSnapshotMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: "JOB",
        entityId: JOB_ID,
        createdById: "00000000-0000-4000-8000-000000000001",
        snapshotJson: expect.objectContaining({
          id: JOB_ID,
          status: "DRAFT",
        }),
      }),
      txMock,
    );
    expect(writeJobCreateAuditLogMock).toHaveBeenCalledTimes(1);
    expect(writeJobCreateAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: JOB_ID,
        createdById: "00000000-0000-4000-8000-000000000001",
        metaJson: expect.objectContaining({
          title: "Senior Fullstack Engineer",
          slug: "senior-fullstack-engineer",
          status: "DRAFT",
        }),
      }),
      txMock,
    );
  });

  it("returns 201 when create payload omits heroImageId", async () => {
    const createPayload = createAdminJobCreatePayloadFixture();
    const payloadWithoutHeroImageId = { ...createPayload };
    delete payloadWithoutHeroImageId.heroImageId;

    txMock.jobPost.create.mockResolvedValueOnce({
      id: JOB_ID,
    });
    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseJob({
        heroImageId: null,
      }),
    );

    const response = await createAdminJob({
      json: vi.fn().mockResolvedValue(payloadWithoutHeroImageId),
    } as unknown as Parameters<typeof createAdminJob>[0]);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
          heroImageId: null,
        }),
      }),
    );
    expect(txMock.jobPost.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          heroImageId: null,
        }),
      }),
    );
  });
});

describe("Admin CMS Jobs Contract: /api/admin/jobs/{id}", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  it("returns 200 with { data } for update payloads", async () => {
    const payload = createAdminJobUpdatePayloadFixture({
      title: "Senior Fullstack Engineer Updated",
    });

    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(createBaseJob());
    txMock.jobPost.update.mockResolvedValueOnce(
      createBaseJob({
        title: "Senior Fullstack Engineer Updated",
      }),
    );

    const response = await adminJobsByIdRoute.PATCH(
      {
        json: vi.fn().mockResolvedValue(payload),
      } as unknown as Parameters<typeof adminJobsByIdRoute.PATCH>[0],
      {
        params: Promise.resolve({ id: JOB_ID }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
          title: "Senior Fullstack Engineer Updated",
          status: "DRAFT",
        }),
      }),
    );
  });

  it("returns 422 envelope for invalid UUID path id", async () => {
    const response = await adminJobsByIdRoute.PATCH(
      {
        json: vi.fn().mockResolvedValue({ title: "patched-title" }),
      } as unknown as Parameters<typeof adminJobsByIdRoute.PATCH>[0],
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
    expect(typeof adminJobsByIdRoute.DELETE).toBe("function");
  });
});

describe("POST /api/admin/jobs/{id}/publish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  it("returns 200 with { data } job detail when transition is valid", async () => {
    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(createBaseJob());
    txMock.jobPost.update.mockResolvedValueOnce(
      createBaseJob({
        status: "PUBLISHED",
        publishAt: new Date("2026-02-11T09:30:00.000Z"),
      }),
    );

    const response = await publishJob({} as Parameters<typeof publishJob>[0], {
      params: Promise.resolve({ id: JOB_ID }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
          status: "PUBLISHED",
          publishAt: expect.any(String),
        }),
      }),
    );
  });

  it("returns 409 error envelope for closed-job publish transition", async () => {
    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseJob({
        status: "CLOSED",
      }),
    );

    const response = await publishJob({} as Parameters<typeof publishJob>[0], {
      params: Promise.resolve({ id: JOB_ID }),
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

  it("returns 409 error envelope for already-published publish transition", async () => {
    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseJob({
        status: "PUBLISHED",
        publishAt: new Date("2026-02-11T09:00:00.000Z"),
      }),
    );

    const response = await publishJob({} as Parameters<typeof publishJob>[0], {
      params: Promise.resolve({ id: JOB_ID }),
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

  it("returns 404 error envelope when job is missing", async () => {
    txMock.jobPost.findUniqueOrThrow.mockRejectedValueOnce(
      createPrismaP2025Error(),
    );

    const response = await publishJob({} as Parameters<typeof publishJob>[0], {
      params: Promise.resolve({ id: JOB_ID }),
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

describe("POST /api/admin/jobs/{id}/schedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  it("returns 200 with { data } job detail when scheduling in the future", async () => {
    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(createBaseJob());
    txMock.jobPost.update.mockResolvedValueOnce(
      createBaseJob({
        status: "SCHEDULED",
        publishAt: null,
        scheduledAt: new Date("2028-01-01T00:00:00.000Z"),
      }),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2028-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleJob>[0];

    const response = await scheduleJob(request, {
      params: Promise.resolve({ id: JOB_ID }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
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
    } as unknown as Parameters<typeof scheduleJob>[0];

    const response = await scheduleJob(request, {
      params: Promise.resolve({ id: JOB_ID }),
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

  it("returns 409 error envelope for published-job schedule transition", async () => {
    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseJob({
        status: "PUBLISHED",
        publishAt: new Date("2026-02-11T09:00:00.000Z"),
      }),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2028-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleJob>[0];

    const response = await scheduleJob(request, {
      params: Promise.resolve({ id: JOB_ID }),
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

  it("returns 409 error envelope for closed-job schedule transition", async () => {
    txMock.jobPost.findUniqueOrThrow.mockResolvedValueOnce(
      createBaseJob({
        status: "CLOSED",
      }),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2028-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleJob>[0];

    const response = await scheduleJob(request, {
      params: Promise.resolve({ id: JOB_ID }),
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

  it("returns 404 error envelope when job is missing", async () => {
    txMock.jobPost.findUniqueOrThrow.mockRejectedValueOnce(
      createPrismaP2025Error(),
    );

    const request = {
      json: vi.fn().mockResolvedValue({
        scheduledAt: "2028-01-01T00:00:00.000Z",
      }),
    } as unknown as Parameters<typeof scheduleJob>[0];

    const response = await scheduleJob(request, {
      params: Promise.resolve({ id: JOB_ID }),
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
