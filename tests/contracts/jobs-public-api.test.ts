import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (operations: Array<Promise<unknown>>) =>
    Promise.all(operations),
  ),
  jobPost: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
}));

import { GET as getJobBySlug } from "@/app/api/jobs/[slug]/route";
import { GET as getJobs } from "@/app/api/jobs/route";

describe("GET /api/jobs", () => {
  const publishedJob = {
    id: "44444444-4444-4444-4444-444444444444",
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    salaryText: "25 - 35 trieu",
    benefits: ["Bao hiem day du"],
    descriptionRich: { type: "doc", content: [] },
    status: "PUBLISHED",
    publishAt: new Date("2026-01-10T08:00:00.000Z"),
    prefecture: {
      id: "77777777-7777-7777-7777-777777777777",
      code: "tokyo",
      nameVN: "Tokyo",
      nameJP: "??",
    },
    heroImage: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with contract shape { items, meta }", async () => {
    prismaMock.jobPost.count.mockResolvedValueOnce(1);
    prismaMock.jobPost.findMany.mockResolvedValueOnce([publishedJob]);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams({
          page: "1",
          pageSize: "10",
          locale: "vi",
        }),
      },
    } as Parameters<typeof getJobs>[0];

    const response = await getJobs(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        meta: expect.objectContaining({
          page: expect.any(Number),
          pageSize: expect.any(Number),
          total: expect.any(Number),
          pageCount: expect.any(Number),
        }),
      }),
    );

    expect(body.items[0]).toEqual(
      expect.objectContaining({
        id: publishedJob.id,
        slug: publishedJob.slug,
        title: publishedJob.title,
        salaryText: publishedJob.salaryText,
        benefits: publishedJob.benefits,
        descriptionRich: publishedJob.descriptionRich,
        status: "PUBLISHED",
      }),
    );
  });

  it("returns 400 for invalid query params", async () => {
    const request = {
      nextUrl: {
        searchParams: new URLSearchParams({ page: "0" }),
      },
    } as Parameters<typeof getJobs>[0];

    const response = await getJobs(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
        }),
      }),
    );
  });

  it("applies pagination and prefecture filters with published-only visibility", async () => {
    prismaMock.jobPost.count.mockResolvedValueOnce(1);
    prismaMock.jobPost.findMany.mockResolvedValueOnce([publishedJob]);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams({
          page: "2",
          pageSize: "5",
          locale: "ja",
          prefecture: "tokyo",
        }),
      },
    } as Parameters<typeof getJobs>[0];

    const response = await getJobs(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meta).toEqual({
      page: 2,
      pageSize: 5,
      total: 1,
      pageCount: 1,
    });

    expect(prismaMock.jobPost.count).toHaveBeenCalledOnce();
    expect(prismaMock.jobPost.findMany).toHaveBeenCalledOnce();

    const countArgs = prismaMock.jobPost.count.mock.calls[0]?.[0] as {
      where?: {
        AND?: Array<Record<string, unknown>>;
      };
    };
    const findManyArgs = prismaMock.jobPost.findMany.mock.calls[0]?.[0] as {
      where?: {
        AND?: Array<Record<string, unknown>>;
      };
      orderBy?: Array<Record<string, "asc" | "desc">>;
      skip?: number;
      take?: number;
    };

    expect(countArgs.where).toEqual(findManyArgs.where);
    expect(findManyArgs.skip).toBe(5);
    expect(findManyArgs.take).toBe(5);
    expect(findManyArgs.orderBy).toEqual([
      { publishAt: "desc" },
      { createdAt: "desc" },
    ]);

    expect(findManyArgs.where?.AND).toEqual(
      expect.arrayContaining([
        {
          AND: [
            { status: "PUBLISHED" },
            {
              OR: [
                { publishAt: null },
                { publishAt: { lte: expect.any(Date) } },
              ],
            },
          ],
        },
        {
          OR: [
            { prefecture: { code: { equals: "tokyo", mode: "insensitive" } } },
            {
              prefecture: {
                nameVN: { contains: "tokyo", mode: "insensitive" },
              },
            },
            {
              prefecture: {
                nameJP: { contains: "tokyo", mode: "insensitive" },
              },
            },
          ],
        },
      ]),
    );
  });
});

describe("GET /api/jobs/{slug}", () => {
  const publishedJob = {
    id: "55555555-5555-5555-5555-555555555555",
    slug: "backend-engineer",
    title: "Backend Engineer",
    salaryText: "30 - 40 trieu",
    benefits: ["Hybrid linh hoat"],
    descriptionRich: { type: "doc", content: [] },
    status: "PUBLISHED",
    publishAt: new Date("2026-01-12T08:00:00.000Z"),
    updatedAt: new Date("2026-01-13T08:00:00.000Z"),
    prefecture: {
      id: "99999999-9999-9999-9999-999999999999",
      code: "osaka",
      nameVN: "Osaka",
      nameJP: "??",
    },
    heroImage: {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      url: "https://cdn.example.com/jobs/backend-engineer.jpg",
      width: 1600,
      height: 900,
      altText: "Backend engineer recruitment hero image",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with required detail contract fields", async () => {
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(publishedJob);

    const response = await getJobBySlug(
      {
        nextUrl: { searchParams: new URLSearchParams() },
        headers: new Headers(),
      } as unknown as Parameters<typeof getJobBySlug>[0],
      {
        params: Promise.resolve({ slug: publishedJob.slug }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      item: {
        id: publishedJob.id,
        slug: publishedJob.slug,
        title: publishedJob.title,
        salaryText: publishedJob.salaryText,
        benefits: publishedJob.benefits,
        descriptionRich: publishedJob.descriptionRich,
        status: "PUBLISHED",
        publishAt: publishedJob.publishAt.toISOString(),
        updatedAt: publishedJob.updatedAt.toISOString(),
        prefecture: {
          id: publishedJob.prefecture.id,
          code: publishedJob.prefecture.code,
          nameVN: publishedJob.prefecture.nameVN,
          nameJP: publishedJob.prefecture.nameJP,
        },
        heroImage: {
          id: publishedJob.heroImage.id,
          url: publishedJob.heroImage.url,
          width: publishedJob.heroImage.width,
          height: publishedJob.heroImage.height,
          altText: publishedJob.heroImage.altText,
        },
      },
    });

    expect(prismaMock.jobPost.findFirst).toHaveBeenCalledOnce();
    const findFirstArgs = prismaMock.jobPost.findFirst.mock.calls[0]?.[0] as {
      where?: {
        AND?: Array<{
          AND?: Array<{
            status?: string;
            OR?: Array<{
              publishAt?: null | { lte: Date };
            }>;
          }>;
          slug?: string;
        }>;
      };
    };

    expect(findFirstArgs.where?.AND?.[1]).toMatchObject({
      slug: publishedJob.slug,
    });
    expect(findFirstArgs.where?.AND?.[0]?.AND?.[0]).toMatchObject({
      status: "PUBLISHED",
    });
    expect(findFirstArgs.where?.AND?.[0]?.AND?.[1]).toEqual({
      OR: [{ publishAt: null }, { publishAt: { lte: expect.any(Date) } }],
    });
  });

  it("returns 404 NOT_FOUND for missing or non-public slug", async () => {
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(null);

    const response = await getJobBySlug(
      {
        nextUrl: { searchParams: new URLSearchParams() },
        headers: new Headers(),
      } as unknown as Parameters<typeof getJobBySlug>[0],
      {
        params: Promise.resolve({ slug: "missing-job" }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "NOT_FOUND",
          message: "Job post was not found.",
        }),
      }),
    );

    expect(prismaMock.jobPost.findFirst).toHaveBeenCalledOnce();
    const findFirstArgs = prismaMock.jobPost.findFirst.mock.calls[0]?.[0] as {
      where?: {
        AND?: Array<{
          AND?: Array<{
            status?: string;
            OR?: Array<{
              publishAt?: null | { lte: Date };
            }>;
          }>;
          slug?: string;
        }>;
      };
    };

    expect(findFirstArgs.where?.AND?.[1]).toMatchObject({
      slug: "missing-job",
    });
    expect(findFirstArgs.where?.AND?.[0]?.AND?.[0]).toMatchObject({
      status: "PUBLISHED",
    });
    expect(findFirstArgs.where?.AND?.[0]?.AND?.[1]).toEqual({
      OR: [{ publishAt: null }, { publishAt: { lte: expect.any(Date) } }],
    });
  });
});
