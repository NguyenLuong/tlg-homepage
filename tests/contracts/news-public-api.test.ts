import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (queries: Array<Promise<unknown>>) =>
    Promise.all(queries),
  ),
  newsPost: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
}));

import { GET as getNewsBySlug } from "@/app/api/news/[slug]/route";
import { GET as getNews } from "@/app/api/news/route";

describe("GET /api/news", () => {
  const publishedNews = {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "tet-hoat-dong-cong-ty",
    title: "Hoat dong Tet cung TLG",
    contentRich: { type: "doc", content: [] },
    status: "PUBLISHED",
    publishAt: new Date("2026-01-15T08:00:00.000Z"),
    category: {
      id: "22222222-2222-2222-2222-222222222222",
      nameVN: "Van hoa doanh nghiep",
      slug: "van-hoa-doanh-nghiep",
      iconKey: "sparkles",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with contract shape { items, meta }", async () => {
    prismaMock.newsPost.count.mockResolvedValueOnce(1);
    prismaMock.newsPost.findMany.mockResolvedValueOnce([publishedNews]);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams({
          page: "1",
          pageSize: "10",
          locale: "vi",
        }),
      },
    } as Parameters<typeof getNews>[0];

    const response = await getNews(request);
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
        id: publishedNews.id,
        slug: publishedNews.slug,
        title: publishedNews.title,
        contentRich: publishedNews.contentRich,
        status: "PUBLISHED",
      }),
    );
  });

  it("returns 400 for invalid query params", async () => {
    const request = {
      nextUrl: {
        searchParams: new URLSearchParams({ page: "0" }),
      },
    } as Parameters<typeof getNews>[0];

    const response = await getNews(request);
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
});

describe("GET /api/news/{slug}", () => {
  const publishedNews = {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "ky-niem-thanh-lap",
    title: "Ky niem thanh lap TLG",
    contentRich: { type: "doc", content: [] },
    status: "PUBLISHED",
    publishAt: new Date("2026-01-20T08:00:00.000Z"),
    category: {
      id: "44444444-4444-4444-4444-444444444444",
      nameVN: "Tin cong ty",
      slug: "tin-cong-ty",
      iconKey: "newspaper",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with required detail contract fields and publish context", async () => {
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(publishedNews);

    const response = await getNewsBySlug(
      {
        nextUrl: { searchParams: new URLSearchParams() },
        headers: new Headers(),
      } as unknown as Parameters<typeof getNewsBySlug>[0],
      {
        params: Promise.resolve({ slug: publishedNews.slug }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      item: {
        id: publishedNews.id,
        slug: publishedNews.slug,
        title: publishedNews.title,
        contentRich: publishedNews.contentRich,
        status: "PUBLISHED",
        publishAt: publishedNews.publishAt.toISOString(),
        category: {
          id: publishedNews.category.id,
          name: publishedNews.category.nameVN,
          slug: publishedNews.category.slug,
          iconKey: publishedNews.category.iconKey,
        },
      },
    });

    expect(prismaMock.newsPost.findFirst).toHaveBeenCalledOnce();
    const findFirstArgs = prismaMock.newsPost.findFirst.mock.calls[0]?.[0] as {
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
      slug: publishedNews.slug,
    });
    expect(findFirstArgs.where?.AND?.[0]?.AND?.[0]).toMatchObject({
      status: "PUBLISHED",
    });
    expect(findFirstArgs.where?.AND?.[0]?.AND?.[1]).toEqual({
      OR: [{ publishAt: null }, { publishAt: { lte: expect.any(Date) } }],
    });
  });

  it("returns 404 NOT_FOUND for missing or non-public slug", async () => {
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(null);

    const response = await getNewsBySlug(
      {
        nextUrl: { searchParams: new URLSearchParams() },
        headers: new Headers(),
      } as unknown as Parameters<typeof getNewsBySlug>[0],
      {
        params: Promise.resolve({ slug: "missing-news" }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "NOT_FOUND",
          message: "News post was not found.",
        }),
      }),
    );

    expect(prismaMock.newsPost.findFirst).toHaveBeenCalledOnce();
    const findFirstArgs = prismaMock.newsPost.findFirst.mock.calls[0]?.[0] as {
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
      slug: "missing-news",
    });
    expect(findFirstArgs.where?.AND?.[0]?.AND?.[0]).toMatchObject({
      status: "PUBLISHED",
    });
    expect(findFirstArgs.where?.AND?.[0]?.AND?.[1]).toEqual({
      OR: [{ publishAt: null }, { publishAt: { lte: expect.any(Date) } }],
    });
  });
});
