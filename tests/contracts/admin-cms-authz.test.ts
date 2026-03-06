import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAdminJobCreatePayloadFixture,
  createAdminJobUpdatePayloadFixture,
  createAdminNewsCreatePayloadFixture,
  createAdminNewsUpdatePayloadFixture,
  createSchedulePayloadFixture,
} from "@/tests/fixtures/public-content";

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

import {
  GET as listAdminJobs,
  POST as createAdminJob,
} from "@/app/api/admin/jobs/route";
import {
  PATCH as updateAdminJob,
  DELETE as deleteAdminJob,
} from "@/app/api/admin/jobs/[id]/route";
import { POST as publishJob } from "@/app/api/admin/jobs/[id]/publish/route";
import { POST as scheduleJob } from "@/app/api/admin/jobs/[id]/schedule/route";
import {
  GET as listAdminNews,
  POST as createAdminNews,
} from "@/app/api/admin/news/route";
import {
  PATCH as updateAdminNews,
  DELETE as deleteAdminNews,
} from "@/app/api/admin/news/[id]/route";
import { POST as publishNews } from "@/app/api/admin/news/[id]/publish/route";
import { POST as scheduleNews } from "@/app/api/admin/news/[id]/schedule/route";

const JOB_ID = "11111111-1111-4111-8111-111111111111";
const NEWS_ID = "22222222-2222-4222-8222-222222222222";

describe("Admin CMS Authorization: Jobs Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/jobs", () => {
    it("returns 401 when user is not authenticated", async () => {
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
      expect(prismaMock.jobPost.findMany).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");

      const response = await listAdminJobs(
        {} as Parameters<typeof listAdminJobs>[0],
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(prismaMock.jobPost.findMany).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/jobs", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");
      const payload = createAdminJobCreatePayloadFixture();

      const response = await createAdminJob({
        json: vi.fn().mockResolvedValue(payload),
      } as unknown as Parameters<typeof createAdminJob>[0]);
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
      expect(txMock.jobPost.create).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeJobCreateAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");
      const payload = createAdminJobCreatePayloadFixture();

      const response = await createAdminJob({
        json: vi.fn().mockResolvedValue(payload),
      } as unknown as Parameters<typeof createAdminJob>[0]);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.jobPost.create).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeJobCreateAuditLogMock).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/admin/jobs/{id}", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");
      const payload = createAdminJobUpdatePayloadFixture();

      const response = await updateAdminJob(
        {
          json: vi.fn().mockResolvedValue(payload),
        } as unknown as Parameters<typeof updateAdminJob>[0],
        { params: Promise.resolve({ id: JOB_ID }) },
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
      expect(txMock.jobPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.jobPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeJobUpdateAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");
      const payload = createAdminJobUpdatePayloadFixture();

      const response = await updateAdminJob(
        {
          json: vi.fn().mockResolvedValue(payload),
        } as unknown as Parameters<typeof updateAdminJob>[0],
        { params: Promise.resolve({ id: JOB_ID }) },
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.jobPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.jobPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeJobUpdateAuditLogMock).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/jobs/{id}", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");

      const mockRequest = new Request(
        `http://localhost/api/admin/jobs/${JOB_ID}?confirm=true`,
      );
      const response = await deleteAdminJob(
        mockRequest as Parameters<typeof deleteAdminJob>[0],
        { params: Promise.resolve({ id: JOB_ID }) },
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
      expect(txMock.jobPost.delete).not.toHaveBeenCalled();
      expect(writeJobDeleteAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");

      const mockRequest = new Request(
        `http://localhost/api/admin/jobs/${JOB_ID}?confirm=true`,
      );
      const response = await deleteAdminJob(
        mockRequest as Parameters<typeof deleteAdminJob>[0],
        { params: Promise.resolve({ id: JOB_ID }) },
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.jobPost.delete).not.toHaveBeenCalled();
      expect(writeJobDeleteAuditLogMock).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/jobs/{id}/publish", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");

      const response = await publishJob(
        {} as Parameters<typeof publishJob>[0],
        { params: Promise.resolve({ id: JOB_ID }) },
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
      expect(txMock.jobPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.jobPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeJobPublishAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");

      const response = await publishJob(
        {} as Parameters<typeof publishJob>[0],
        { params: Promise.resolve({ id: JOB_ID }) },
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.jobPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.jobPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeJobPublishAuditLogMock).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/jobs/{id}/schedule", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");
      const payload = createSchedulePayloadFixture();

      const response = await scheduleJob(
        {
          json: vi.fn().mockResolvedValue(payload),
        } as unknown as Parameters<typeof scheduleJob>[0],
        { params: Promise.resolve({ id: JOB_ID }) },
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
      expect(txMock.jobPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.jobPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeJobScheduleAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");
      const payload = createSchedulePayloadFixture();

      const response = await scheduleJob(
        {
          json: vi.fn().mockResolvedValue(payload),
        } as unknown as Parameters<typeof scheduleJob>[0],
        { params: Promise.resolve({ id: JOB_ID }) },
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.jobPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.jobPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeJobScheduleAuditLogMock).not.toHaveBeenCalled();
    });
  });
});

describe("Admin CMS Authorization: News Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/news", () => {
    it("returns 401 when user is not authenticated", async () => {
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
      expect(prismaMock.newsPost.findMany).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");

      const response = await listAdminNews(
        {} as Parameters<typeof listAdminNews>[0],
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(prismaMock.newsPost.findMany).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/news", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");
      const payload = createAdminNewsCreatePayloadFixture();

      const response = await createAdminNews({
        json: vi.fn().mockResolvedValue(payload),
      } as unknown as Parameters<typeof createAdminNews>[0]);
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
      expect(txMock.newsPost.create).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeNewsCreateAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");
      const payload = createAdminNewsCreatePayloadFixture();

      const response = await createAdminNews({
        json: vi.fn().mockResolvedValue(payload),
      } as unknown as Parameters<typeof createAdminNews>[0]);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.newsPost.create).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeNewsCreateAuditLogMock).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/admin/news/{id}", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");
      const payload = createAdminNewsUpdatePayloadFixture();

      const response = await updateAdminNews(
        {
          json: vi.fn().mockResolvedValue(payload),
        } as unknown as Parameters<typeof updateAdminNews>[0],
        { params: Promise.resolve({ id: NEWS_ID }) },
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
      expect(txMock.newsPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.newsPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeNewsUpdateAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");
      const payload = createAdminNewsUpdatePayloadFixture();

      const response = await updateAdminNews(
        {
          json: vi.fn().mockResolvedValue(payload),
        } as unknown as Parameters<typeof updateAdminNews>[0],
        { params: Promise.resolve({ id: NEWS_ID }) },
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.newsPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.newsPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeNewsUpdateAuditLogMock).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/news/{id}", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");

      const mockRequest = new Request(
        `http://localhost/api/admin/news/${NEWS_ID}?confirm=true`,
      );
      const response = await deleteAdminNews(
        mockRequest as Parameters<typeof deleteAdminNews>[0],
        { params: Promise.resolve({ id: NEWS_ID }) },
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
      expect(txMock.newsPost.delete).not.toHaveBeenCalled();
      expect(writeNewsDeleteAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");

      const mockRequest = new Request(
        `http://localhost/api/admin/news/${NEWS_ID}?confirm=true`,
      );
      const response = await deleteAdminNews(
        mockRequest as Parameters<typeof deleteAdminNews>[0],
        { params: Promise.resolve({ id: NEWS_ID }) },
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.newsPost.delete).not.toHaveBeenCalled();
      expect(writeNewsDeleteAuditLogMock).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/news/{id}/publish", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");

      const response = await publishNews(
        {} as Parameters<typeof publishNews>[0],
        { params: Promise.resolve({ id: NEWS_ID }) },
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
      expect(txMock.newsPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.newsPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeNewsPublishAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");

      const response = await publishNews(
        {} as Parameters<typeof publishNews>[0],
        { params: Promise.resolve({ id: NEWS_ID }) },
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.newsPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.newsPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeNewsPublishAuditLogMock).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/news/{id}/schedule", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockCmsAuthUnauthorized("Authentication is required.");
      const payload = createSchedulePayloadFixture();

      const response = await scheduleNews(
        {
          json: vi.fn().mockResolvedValue(payload),
        } as unknown as Parameters<typeof scheduleNews>[0],
        { params: Promise.resolve({ id: NEWS_ID }) },
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
      expect(txMock.newsPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.newsPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeNewsScheduleAuditLogMock).not.toHaveBeenCalled();
    });

    it("returns 403 when user lacks editor role", async () => {
      mockCmsAuthForbidden("Requires EDITOR role.");
      const payload = createSchedulePayloadFixture();

      const response = await scheduleNews(
        {
          json: vi.fn().mockResolvedValue(payload),
        } as unknown as Parameters<typeof scheduleNews>[0],
        { params: Promise.resolve({ id: NEWS_ID }) },
      );
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: "FORBIDDEN",
            message: "Requires EDITOR role.",
          }),
        }),
      );
      expect(txMock.newsPost.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(txMock.newsPost.update).not.toHaveBeenCalled();
      expect(writeRevisionSnapshotMock).not.toHaveBeenCalled();
      expect(writeNewsScheduleAuditLogMock).not.toHaveBeenCalled();
    });
  });
});
