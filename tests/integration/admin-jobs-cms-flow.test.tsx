import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminJobCreatePayloadFixture,
  createAdminJobUpdatePayloadFixture,
  createSchedulePayloadFixture,
} from "@/tests/fixtures/public-content";

const JOB_ID = "11111111-1111-4111-8111-111111111111";

type JobRecord = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED";
  sortWeight: number;
  isUrgent: boolean;
  publishAt: Date | null;
  scheduledAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  locationPrefectureId: string;
  salaryText: string;
  benefits: string[];
  descriptionRich: Record<string, unknown>;
  requirementsRich: Record<string, unknown>;
  processRich: Record<string, unknown> | null;
  headcountText: string | null;
  deadlineAt: Date | null;
  employmentType: string;
  categoryId: string;
  heroImageId: string | null;
  urgentRank: number;
  createdById: string;
  updatedById: string;
};

const txMock = vi.hoisted(() => ({
  jobPost: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  jobPostTag: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
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
  prisma: prismaMock,
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

const CATEGORY = {
  id: "88888888-8888-4888-8888-888888888888",
  nameVN: "Engineering",
  slug: "engineering",
};
const PREFECTURE = {
  id: "77777777-7777-4777-8777-777777777777",
  code: "tokyo",
  nameVN: "Tokyo",
  nameJP: "Tokyo",
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
    url: `https://example.test/api/admin/jobs/${JOB_ID}?${searchParams.toString()}`,
  };
}

describe("Admin jobs CMS integration flow", () => {
  let jobs = new Map<string, JobRecord>();
  let jobTags = new Map<string, string[]>();

  function hydrate(record: JobRecord) {
    return {
      ...record,
      benefits: [...record.benefits],
      descriptionRich: { ...record.descriptionRich },
      requirementsRich: { ...record.requirementsRich },
      processRich: record.processRich ? { ...record.processRich } : null,
      category: CATEGORY,
      prefecture: PREFECTURE,
      jobPostTags: (jobTags.get(record.id) ?? []).map((tagId) => ({
        tag: {
          id: tagId,
          nameVN: `Tag ${tagId.slice(0, 4)}`,
          slug: `tag-${tagId.slice(0, 4)}`,
        },
      })),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    jobs = new Map();
    jobTags = new Map();

    prismaMock.jobPost.findMany.mockImplementation(async () =>
      [...jobs.values()].map((record) => hydrate(record)),
    );

    txMock.jobPost.create.mockImplementation(
      async ({
        data,
      }: {
        data: Omit<JobRecord, "id" | "createdAt" | "updatedAt">;
      }) => {
        jobs.set(JOB_ID, {
          ...data,
          id: JOB_ID,
          createdAt: new Date("2026-02-11T09:00:00.000Z"),
          updatedAt: new Date("2026-02-11T09:00:00.000Z"),
        });

        return { id: JOB_ID };
      },
    );

    txMock.jobPost.findUniqueOrThrow.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const record = jobs.get(where.id);
        if (!record) {
          throw {
            name: "PrismaClientKnownRequestError" as const,
            code: "P2025",
          };
        }
        return hydrate(record);
      },
    );

    txMock.jobPost.update.mockImplementation(
      async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<JobRecord>;
      }) => {
        const existing = jobs.get(where.id);
        if (!existing) {
          throw {
            name: "PrismaClientKnownRequestError" as const,
            code: "P2025",
          };
        }

        const updated: JobRecord = {
          ...existing,
          ...data,
          updatedAt: new Date("2026-02-11T09:30:00.000Z"),
        };
        jobs.set(where.id, updated);
        return hydrate(updated);
      },
    );

    txMock.jobPost.delete.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const existing = jobs.get(where.id);
        if (!existing) {
          throw {
            name: "PrismaClientKnownRequestError" as const,
            code: "P2025",
          };
        }
        jobs.delete(where.id);
        jobTags.delete(where.id);
        return existing;
      },
    );

    txMock.jobPostTag.deleteMany.mockImplementation(
      async ({ where }: { where: { jobPostId: string } }) => {
        jobTags.set(where.jobPostId, []);
        return { count: 1 };
      },
    );

    txMock.jobPostTag.createMany.mockImplementation(
      async ({
        data,
      }: {
        data: Array<{ jobPostId: string; tagId: string }>;
      }) => {
        const jobPostId = data[0]?.jobPostId;
        if (jobPostId) {
          jobTags.set(
            jobPostId,
            data.map((entry) => entry.tagId),
          );
        }
        return { count: data.length };
      },
    );
  });

  it("supports create/list/update/schedule/publish/delete lifecycle with delete confirmation", async () => {
    const createPayload = createAdminJobCreatePayloadFixture();

    const createResponse = await createAdminJob(
      createRequestWithJson(createPayload) as unknown as Parameters<
        typeof createAdminJob
      >[0],
    );
    const createBody = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(createBody).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
          title: createPayload.title,
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
          title: createPayload.title,
          slug: createPayload.slug,
          status: "DRAFT",
        }),
      }),
      txMock,
    );

    const listAfterCreateResponse = await listAdminJobs(
      {} as unknown as Parameters<typeof listAdminJobs>[0],
    );
    const listAfterCreateBody = await listAfterCreateResponse.json();

    expect(listAfterCreateResponse.status).toBe(200);
    expect(listAfterCreateBody.data.items).toHaveLength(1);
    expect(listAfterCreateBody.data.items[0]).toEqual(
      expect.objectContaining({
        id: JOB_ID,
        title: createPayload.title,
      }),
    );

    const updatePayload = createAdminJobUpdatePayloadFixture({
      title: "Senior Fullstack Engineer Updated",
    });

    const updateResponse = await adminJobsByIdRoute.PATCH(
      createRequestWithJson(updatePayload) as unknown as Parameters<
        typeof adminJobsByIdRoute.PATCH
      >[0],
      {
        params: Promise.resolve({ id: JOB_ID }),
      },
    );
    const updateBody = await updateResponse.json();

    expect(updateResponse.status).toBe(200);
    expect(updateBody).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
          title: "Senior Fullstack Engineer Updated",
          status: "DRAFT",
        }),
      }),
    );

    const scheduledAtIso = "2028-01-01T00:00:00.000Z";
    const scheduleResponse = await scheduleJob(
      createRequestWithJson(
        createSchedulePayloadFixture(scheduledAtIso),
      ) as unknown as Parameters<typeof scheduleJob>[0],
      {
        params: Promise.resolve({ id: JOB_ID }),
      },
    );
    const scheduleBody = await scheduleResponse.json();

    expect(scheduleResponse.status).toBe(200);
    expect(scheduleBody).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
          status: "SCHEDULED",
          scheduledAt: scheduledAtIso,
          publishAt: null,
        }),
      }),
    );

    const publishResponse = await publishJob(
      {} as unknown as Parameters<typeof publishJob>[0],
      {
        params: Promise.resolve({ id: JOB_ID }),
      },
    );
    const publishBody = await publishResponse.json();

    expect(publishResponse.status).toBe(200);
    expect(publishBody).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: JOB_ID,
          status: "PUBLISHED",
          publishAt: expect.any(String),
          scheduledAt: null,
        }),
      }),
    );

    const deleteWithoutConfirmResponse = await adminJobsByIdRoute.DELETE(
      createDeleteRequest("false") as unknown as Parameters<
        typeof adminJobsByIdRoute.DELETE
      >[0],
      {
        params: Promise.resolve({ id: JOB_ID }),
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

    const deleteWithConfirmResponse = await adminJobsByIdRoute.DELETE(
      createDeleteRequest("true") as unknown as Parameters<
        typeof adminJobsByIdRoute.DELETE
      >[0],
      {
        params: Promise.resolve({ id: JOB_ID }),
      },
    );
    const deleteWithConfirmBody = await deleteWithConfirmResponse.json();

    expect(deleteWithConfirmResponse.status).toBe(200);
    expect(deleteWithConfirmBody).toEqual({
      data: {
        id: JOB_ID,
        deleted: true,
      },
    });
    expect(writeJobDeleteAuditLogMock).toHaveBeenCalledTimes(1);
    expect(writeJobDeleteAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: JOB_ID,
        createdById: "00000000-0000-4000-8000-000000000001",
        metaJson: expect.objectContaining({
          fromStatus: "PUBLISHED",
          deletedAt: expect.any(String),
          title: "Senior Fullstack Engineer Updated",
          slug: expect.any(String),
        }),
      }),
      txMock,
    );

    const listAfterDeleteResponse = await listAdminJobs(
      {} as unknown as Parameters<typeof listAdminJobs>[0],
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
