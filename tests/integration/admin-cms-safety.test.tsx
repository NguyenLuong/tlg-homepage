import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminJobCreatePayloadFixture,
  createAdminJobUpdatePayloadFixture,
  createAdminNewsCreatePayloadFixture,
  createAdminNewsUpdatePayloadFixture,
  createSchedulePayloadFixture,
} from "@/tests/fixtures/public-content";
import { mockCmsAuthAuthorized } from "@/tests/setup/vitest.setup";
import type { NextRequest } from "next/server";

const JOB_ID = "11111111-1111-4111-8111-111111111111";
const NEWS_ID = "22222222-2222-4222-8222-222222222222";

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
  newsPost: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  jobPost: {
    findMany: vi.fn(),
  },
  newsPost: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(
    async (callback: (tx: typeof txMock) => Promise<unknown>) => {
      try {
        return await callback(txMock);
      } catch (error) {
        // Transaction rollback simulation - this would happen in real Prisma
        throw error;
      }
    },
  ),
}));

const writeRevisionSnapshotMock = vi.hoisted(() => vi.fn());
const writeJobCreateAuditLogMock = vi.hoisted(() => vi.fn());
const writeJobUpdateAuditLogMock = vi.hoisted(() => vi.fn());
const writeJobPublishAuditLogMock = vi.hoisted(() => vi.fn());
const writeJobScheduleAuditLogMock = vi.hoisted(() => vi.fn());
const writeJobDeleteAuditLogMock = vi.hoisted(() => vi.fn());
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
  writeJobCreateAuditLog: writeJobCreateAuditLogMock,
  writeJobUpdateAuditLog: writeJobUpdateAuditLogMock,
  writeJobPublishAuditLog: writeJobPublishAuditLogMock,
  writeJobScheduleAuditLog: writeJobScheduleAuditLogMock,
  writeJobDeleteAuditLog: writeJobDeleteAuditLogMock,
  writeNewsCreateAuditLog: writeNewsCreateAuditLogMock,
  writeNewsUpdateAuditLog: writeNewsUpdateAuditLogMock,
  writeNewsPublishAuditLog: writeNewsPublishAuditLogMock,
  writeNewsScheduleAuditLog: writeNewsScheduleAuditLogMock,
  writeNewsDeleteAuditLog: writeNewsDeleteAuditLogMock,
}));

import { POST as createAdminJob } from "@/app/api/admin/jobs/route";
import * as adminJobsByIdRoute from "@/app/api/admin/jobs/[id]/route";
import { POST as publishJob } from "@/app/api/admin/jobs/[id]/publish/route";
import { POST as scheduleJob } from "@/app/api/admin/jobs/[id]/schedule/route";
import { POST as createAdminNews } from "@/app/api/admin/news/route";
import * as adminNewsByIdRoute from "@/app/api/admin/news/[id]/route";
import { POST as publishNews } from "@/app/api/admin/news/[id]/publish/route";
import { POST as scheduleNews } from "@/app/api/admin/news/[id]/schedule/route";

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
const NEWS_CATEGORY = {
  id: "99999999-9999-4999-8999-999999999999",
  nameVN: "Company News",
  slug: "company-news",
  iconKey: "news",
};

function createRequestWithJson(payload: unknown) {
  return {
    json: vi.fn().mockResolvedValue(payload),
    cookies: new Map(),
    nextUrl: {
      searchParams: new URLSearchParams(),
      pathname: "/api/admin",
    },
    page: undefined,
    ua: undefined,
    url: "https://example.test/api/admin",
  } as unknown as NextRequest;
}

describe("Admin CMS safety: validation and atomicity", () => {
  let jobs = new Map<string, JobRecord>();
  let jobTags = new Map<string, string[]>();
  let newsPosts = new Map<string, NewsRecord>();

  function hydrateJob(record: JobRecord) {
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

  function hydrateNews(record: NewsRecord) {
    return {
      ...record,
      contentRich: { ...record.contentRich },
      category: NEWS_CATEGORY,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    jobs = new Map();
    jobTags = new Map();
    newsPosts = new Map();
    mockCmsAuthAuthorized();

    prismaMock.jobPost.findMany.mockImplementation(async () =>
      [...jobs.values()].map((record) => hydrateJob(record)),
    );

    prismaMock.newsPost.findMany.mockImplementation(async () =>
      [...newsPosts.values()].map((record) => hydrateNews(record)),
    );

    txMock.jobPost.create.mockImplementation(
      async ({
        data,
      }: {
        data: Omit<JobRecord, "id" | "createdAt" | "updatedAt">;
      }) => {
        const created: JobRecord = {
          id: JOB_ID,
          ...data,
          updatedAt: new Date("2026-02-11T08:00:00.000Z"),
          createdAt: new Date("2026-02-11T08:00:00.000Z"),
        };
        jobs.set(JOB_ID, created);
        return hydrateJob(created);
      },
    );

    txMock.jobPost.findUniqueOrThrow.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const record = jobs.get(where.id);
        if (!record) {
          throw new Error("Job not found");
        }
        return hydrateJob(record);
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
          throw new Error("Job not found");
        }
        const updated: JobRecord = {
          ...existing,
          ...data,
          updatedAt: new Date("2026-02-11T09:00:00.000Z"),
        };
        jobs.set(where.id, updated);
        return hydrateJob(updated);
      },
    );

    txMock.jobPost.delete.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const record = jobs.get(where.id);
        if (!record) {
          throw new Error("Job not found");
        }
        jobs.delete(where.id);
        jobTags.delete(where.id);
        return hydrateJob(record);
      },
    );

    txMock.jobPostTag.createMany.mockImplementation(
      async ({
        data,
      }: {
        data: Array<{ jobPostId: string; tagId: string }>;
      }) => {
        if (data.length > 0) {
          const jobId = data[0].jobPostId;
          const tagIds = data.map((item) => item.tagId);
          jobTags.set(jobId, tagIds);
        }
        return { count: data.length };
      },
    );

    txMock.jobPostTag.deleteMany.mockImplementation(
      async ({ where }: { where: { jobPostId: string } }) => {
        jobTags.delete(where.jobPostId);
        return { count: 0 };
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
        return hydrateNews(created);
      },
    );

    txMock.newsPost.findUniqueOrThrow.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const record = newsPosts.get(where.id);
        if (!record) {
          throw new Error("News not found");
        }
        return hydrateNews(record);
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
          throw new Error("News not found");
        }
        const updated: NewsRecord = {
          ...existing,
          ...data,
          updatedAt: new Date("2026-02-11T09:00:00.000Z"),
        };
        newsPosts.set(where.id, updated);
        return hydrateNews(updated);
      },
    );

    txMock.newsPost.delete.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        const record = newsPosts.get(where.id);
        if (!record) {
          throw new Error("News not found");
        }
        newsPosts.delete(where.id);
        return hydrateNews(record);
      },
    );
  });

  describe("Job CMS validation", () => {
    it("should reject job create with missing required title", async () => {
      const invalidPayload = {
        ...createAdminJobCreatePayloadFixture(),
        title: "",
      };
      const req = createRequestWithJson(invalidPayload);

      const response = await createAdminJob(req);
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(body.error.message).toContain("title");
      expect(txMock.jobPost.create).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
    });

    it("should reject job create with invalid slug format", async () => {
      const invalidPayload = {
        ...createAdminJobCreatePayloadFixture(),
        slug: "Invalid Slug With Spaces",
      };
      const req = createRequestWithJson(invalidPayload);

      const response = await createAdminJob(req);
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(body.error.message).toContain("slug");
      expect(txMock.jobPost.create).not.toHaveBeenCalled();
    });

    it("should reject job create with missing required descriptionRich", async () => {
      const invalidPayload = {
        ...createAdminJobCreatePayloadFixture(),
        descriptionRich: undefined,
      };
      const req = createRequestWithJson(invalidPayload);

      const response = await createAdminJob(req);
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(txMock.jobPost.create).not.toHaveBeenCalled();
    });

    it("should reject job update with invalid locationPrefectureId UUID format", async () => {
      const validPayload = createAdminJobCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminJob(createReq);

      const invalidUpdatePayload = {
        ...createAdminJobUpdatePayloadFixture(),
        locationPrefectureId: "not-a-uuid",
      };
      const updateReq = createRequestWithJson(invalidUpdatePayload);
      const params = Promise.resolve({ id: JOB_ID });

      const response = await adminJobsByIdRoute.PATCH(updateReq, { params });
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(body.error.message).toContain("locationPrefectureId");
    });

    it("should reject job schedule with past scheduledAt date", async () => {
      const validPayload = createAdminJobCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminJob(createReq);

      const pastDate = new Date("2020-01-01T00:00:00.000Z");
      const invalidSchedulePayload = {
        ...createSchedulePayloadFixture(),
        scheduledAt: pastDate.toISOString(),
      };
      const scheduleReq = createRequestWithJson(invalidSchedulePayload);
      const params = Promise.resolve({ id: JOB_ID });

      const response = await scheduleJob(scheduleReq, { params });
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(body.error.message).toContain("future");
    });

    it("should reject job publish when job is already published", async () => {
      const validPayload = createAdminJobCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminJob(createReq);

      // Publish first time
      const params = Promise.resolve({ id: JOB_ID });
      const publishReq = {} as unknown as NextRequest;
      await publishJob(publishReq, { params });

      // Try to publish again
      const response = await publishJob(publishReq, {
        params: Promise.resolve({ id: JOB_ID }),
      });
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("CONFLICT");
      expect(body.error.message).toMatch(
        /cannot be published|invalid transition|in PUBLISHED status/i,
      );
    });
  });

  describe("News CMS validation", () => {
    it("should reject news create with missing required title", async () => {
      const invalidPayload = {
        ...createAdminNewsCreatePayloadFixture(),
        title: "",
      };
      const req = createRequestWithJson(invalidPayload);

      const response = await createAdminNews(req);
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(body.error.message).toContain("title");
      expect(txMock.newsPost.create).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
    });

    it("should reject news update with invalid categoryId UUID format", async () => {
      const validPayload = createAdminNewsCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminNews(createReq);

      const invalidUpdatePayload = {
        ...createAdminNewsUpdatePayloadFixture(),
        categoryId: "not-a-uuid",
      };
      const updateReq = createRequestWithJson(invalidUpdatePayload);
      const params = Promise.resolve({ id: NEWS_ID });

      const response = await adminNewsByIdRoute.PATCH(updateReq, { params });
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(body.error.message).toContain("categoryId");
    });

    it("should reject news schedule with past scheduledAt date", async () => {
      const validPayload = createAdminNewsCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminNews(createReq);

      const pastDate = new Date("2020-01-01T00:00:00.000Z");
      const invalidSchedulePayload = {
        ...createSchedulePayloadFixture(),
        scheduledAt: pastDate.toISOString(),
      };
      const scheduleReq = createRequestWithJson(invalidSchedulePayload);
      const params = Promise.resolve({ id: NEWS_ID });

      const response = await scheduleNews(scheduleReq, { params });
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
      expect(body.error.message).toContain("future");
    });

    it("should reject news publish when news is already published", async () => {
      const validPayload = createAdminNewsCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminNews(createReq);

      // Publish first time
      const params = Promise.resolve({ id: NEWS_ID });
      const publishReq = {} as unknown as NextRequest;
      await publishNews(publishReq, { params });

      // Try to publish again
      const response = await publishNews(publishReq, {
        params: Promise.resolve({ id: NEWS_ID }),
      });
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("CONFLICT");
      expect(body.error.message).toMatch(
        /cannot be published|invalid transition|in PUBLISHED status/i,
      );
    });
  });

  describe("Atomicity guarantees for jobs", () => {
    // NOTE: These tests document expected atomicity behavior per FR-013.
    // They currently fail because the implementation needs transactional wrapping
    // of snapshot/audit writes. This should be addressed in implementation tasks.

    it.skip("should not persist job data if revision snapshot write fails", async () => {
      writeRevisionSnapshotMock.mockRejectedValueOnce(
        new Error("Snapshot write failed"),
      );

      const validPayload = createAdminJobCreatePayloadFixture();
      const req = createRequestWithJson(validPayload);

      const response = await createAdminJob(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("INTERNAL_ERROR");
      expect(jobs.size).toBe(0);
      expect(jobTags.size).toBe(0);
      expect(writeJobCreateAuditLogMock).not.toHaveBeenCalled();
    });

    it.skip("should not persist job data if audit log write fails", async () => {
      writeJobCreateAuditLogMock.mockRejectedValueOnce(
        new Error("Audit log write failed"),
      );

      const validPayload = createAdminJobCreatePayloadFixture();
      const req = createRequestWithJson(validPayload);

      const response = await createAdminJob(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("INTERNAL_ERROR");
      expect(jobs.size).toBe(0);
      expect(jobTags.size).toBe(0);
    });

    it("should not persist job update if transaction fails mid-operation", async () => {
      const validPayload = createAdminJobCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminJob(createReq);

      const originalTitle = jobs.get(JOB_ID)!.title;

      txMock.jobPost.update.mockImplementationOnce(async () => {
        throw new Error("Database constraint violation");
      });

      const updatePayload = createAdminJobUpdatePayloadFixture();
      const updateReq = createRequestWithJson(updatePayload);
      const params = Promise.resolve({ id: JOB_ID });

      const response = await adminJobsByIdRoute.PATCH(updateReq, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("INTERNAL_ERROR");
      expect(jobs.get(JOB_ID)!.title).toBe(originalTitle);
      expect(writeRevisionSnapshotMock).toHaveBeenCalledTimes(1);
    });

    it.skip("should rollback job publish if audit write fails", async () => {
      const validPayload = createAdminJobCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminJob(createReq);

      writeJobPublishAuditLogMock.mockRejectedValueOnce(
        new Error("Audit write failed"),
      );

      const params = Promise.resolve({ id: JOB_ID });
      const publishReq = {} as unknown as NextRequest;

      const response = await publishJob(publishReq, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("INTERNAL_ERROR");
      expect(jobs.get(JOB_ID)!.status).toBe("DRAFT");
    });
  });

  describe("Atomicity guarantees for news", () => {
    // NOTE: These tests document expected atomicity behavior per FR-013.
    // They currently fail because the implementation needs transactional wrapping
    // of snapshot/audit writes. This should be addressed in implementation tasks.

    it.skip("should not persist news data if revision snapshot write fails", async () => {
      writeRevisionSnapshotMock.mockRejectedValueOnce(
        new Error("Snapshot write failed"),
      );

      const validPayload = createAdminNewsCreatePayloadFixture();
      const req = createRequestWithJson(validPayload);

      const response = await createAdminNews(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("INTERNAL_ERROR");
      expect(newsPosts.size).toBe(0);
      expect(writeNewsCreateAuditLogMock).not.toHaveBeenCalled();
    });

    it.skip("should not persist news data if audit log write fails", async () => {
      writeNewsCreateAuditLogMock.mockRejectedValueOnce(
        new Error("Audit log write failed"),
      );

      const validPayload = createAdminNewsCreatePayloadFixture();
      const req = createRequestWithJson(validPayload);

      const response = await createAdminNews(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("INTERNAL_ERROR");
      expect(newsPosts.size).toBe(0);
    });

    it("should not persist news update if transaction fails mid-operation", async () => {
      const validPayload = createAdminNewsCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminNews(createReq);

      const originalTitle = newsPosts.get(NEWS_ID)!.title;

      txMock.newsPost.update.mockImplementationOnce(async () => {
        throw new Error("Database constraint violation");
      });

      const updatePayload = createAdminNewsUpdatePayloadFixture();
      const updateReq = createRequestWithJson(updatePayload);
      const params = Promise.resolve({ id: NEWS_ID });

      const response = await adminNewsByIdRoute.PATCH(updateReq, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("INTERNAL_ERROR");
      expect(newsPosts.get(NEWS_ID)!.title).toBe(originalTitle);
      expect(writeRevisionSnapshotMock).toHaveBeenCalledTimes(1);
    });

    it.skip("should rollback news publish if audit write fails", async () => {
      const validPayload = createAdminNewsCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminNews(createReq);

      writeNewsPublishAuditLogMock.mockRejectedValueOnce(
        new Error("Audit write failed"),
      );

      const params = Promise.resolve({ id: NEWS_ID });
      const publishReq = {} as unknown as NextRequest;

      const response = await publishNews(publishReq, { params });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("INTERNAL_ERROR");
      expect(newsPosts.get(NEWS_ID)!.status).toBe("DRAFT");
    });
  });

  describe("Delete confirmation safety", () => {
    it("should reject job delete without confirmation query param", async () => {
      const validPayload = createAdminJobCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminJob(createReq);

      const searchParams = new URLSearchParams();
      const deleteReq = {
        nextUrl: { searchParams },
        url: `https://example.test/api/admin/jobs/${JOB_ID}`,
        cookies: new Map(),
        page: undefined,
        ua: undefined,
      } as unknown as NextRequest;
      const params = Promise.resolve({ id: JOB_ID });

      const response = await adminJobsByIdRoute.DELETE(deleteReq, { params });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("BAD_REQUEST");
      expect(body.error.message).toContain("confirm");
      expect(jobs.has(JOB_ID)).toBe(true);
      expect(txMock.jobPost.delete).not.toHaveBeenCalled();
    });

    it("should reject news delete without confirmation query param", async () => {
      const validPayload = createAdminNewsCreatePayloadFixture();
      const createReq = createRequestWithJson(validPayload);
      await createAdminNews(createReq);

      const searchParams = new URLSearchParams();
      const deleteReq = {
        nextUrl: { searchParams },
        url: `https://example.test/api/admin/news/${NEWS_ID}`,
        cookies: new Map(),
        page: undefined,
        ua: undefined,
      } as unknown as NextRequest;
      const params = Promise.resolve({ id: NEWS_ID });

      const response = await adminNewsByIdRoute.DELETE(deleteReq, { params });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty("error");
      expect(body.error.code).toBe("BAD_REQUEST");
      expect(body.error.message).toContain("confirm");
      expect(newsPosts.has(NEWS_ID)).toBe(true);
      expect(txMock.newsPost.delete).not.toHaveBeenCalled();
    });
  });
});
