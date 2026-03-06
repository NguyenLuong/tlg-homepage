import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  publishedJobFixtures,
  publishedNewsFixtures,
} from "@/tests/fixtures/public-content";

const prismaMock = vi.hoisted(() => ({
  jobPost: {
    findFirst: vi.fn(),
  },
  newsPost: {
    findFirst: vi.fn(),
  },
  page: {
    findFirst: vi.fn(async () => null),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

function createJobRecord(overrides: Partial<Record<string, unknown>> = {}) {
  const fixture = publishedJobFixtures[0];

  return {
    id: fixture.id,
    title: fixture.title,
    slug: fixture.slug,
    salaryText: fixture.salaryText,
    benefits: fixture.benefits,
    descriptionRich: {
      type: "doc",
      content: [{ type: "paragraph", text: "Mo ta cong viec chi tiet." }],
    },
    requirementsRich: {
      type: "doc",
      content: [
        { type: "paragraph", text: "Yeu cau kinh nghiem toi thieu 2 nam." },
      ],
    },
    processRich: {
      type: "doc",
      content: [
        { type: "paragraph", text: "Phong van 2 vong va bai test nho." },
      ],
    },
    headcountText: "2",
    deadlineAt: new Date("2026-03-01T08:00:00.000Z"),
    employmentType: "FULL_TIME",
    isUrgent: false,
    publishAt: new Date("2026-01-10T08:00:00.000Z"),
    updatedAt: new Date("2026-01-10T08:00:00.000Z"),
    category: {
      nameVN: "Engineering",
      slug: "engineering",
    },
    prefecture: {
      nameJP: "Toukyou",
      nameVN: "Tokyo",
      code: "tokyo",
    },
    heroImage: null,
    jobPostTags: [],
    ...overrides,
  };
}

function createNewsRecord(overrides: Partial<Record<string, unknown>> = {}) {
  const fixture = publishedNewsFixtures[0];

  return {
    id: fixture.id,
    slug: fixture.slug,
    title: fixture.title,
    excerpt: fixture.excerpt,
    contentRich: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          text: "Doan mo dau gioi thieu noi dung bai viet.",
        },
      ],
    },
    publishAt: new Date("2026-01-15T08:00:00.000Z"),
    updatedAt: new Date("2026-01-16T08:00:00.000Z"),
    category: {
      nameVN: "Tin cong ty",
      slug: "tin-cong-ty",
    },
    coverImage: null,
    ...overrides,
  };
}

describe("Public SEO metadata parity across detail pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.jobPost.findFirst.mockReset();
    prismaMock.newsPost.findFirst.mockReset();
  });

  it("keeps canonical and open-graph URLs aligned for jobs and news detail metadata", async () => {
    const jobFixture = publishedJobFixtures[0];
    const newsFixture = publishedNewsFixtures[0];

    prismaMock.jobPost.findFirst.mockResolvedValueOnce(createJobRecord());
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(createNewsRecord());

    const jobsModule = await import("@/app/(public)/jobs/[slug]/page");
    const newsModule = await import("@/app/(public)/news/[slug]/page");

    const jobMetadata = await jobsModule.generateMetadata(
      createAppRouterPageProps({
        params: {
          locale: "ja",
          slug: jobFixture.slug,
        },
        searchParams: {
          page: "2",
          pageSize: "20",
          sort: "urgent",
        },
      }),
    );

    const newsMetadata = await newsModule.generateMetadata(
      createAppRouterPageProps({
        params: {
          locale: "ja",
          slug: newsFixture.slug,
        },
        searchParams: {
          page: "2",
        },
      }),
    );

    expect(jobMetadata.alternates?.canonical).toBe(
      `/ja/jobs/${jobFixture.slug}`,
    );
    expect(jobMetadata.openGraph?.url).toBe(`/ja/jobs/${jobFixture.slug}`);
    expect(String(jobMetadata.alternates?.canonical)).not.toContain("?");

    expect(newsMetadata.alternates?.canonical).toBe(
      `/ja/news/${newsFixture.slug}`,
    );
    expect(newsMetadata.openGraph?.url).toBe(`/ja/news/${newsFixture.slug}`);
    expect(String(newsMetadata.alternates?.canonical)).not.toContain("?");
  }, 15_000);

  it("keeps locale route metadata output in parity with source jobs/news detail pages", async () => {
    const jobFixture = publishedJobFixtures[0];
    const newsFixture = publishedNewsFixtures[0];

    prismaMock.jobPost.findFirst.mockResolvedValueOnce(createJobRecord());
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(createJobRecord());
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(createNewsRecord());
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(createNewsRecord());

    const jobsModule = await import("@/app/(public)/jobs/[slug]/page");
    const localeJobsModule =
      await import("@/app/(public)/[locale]/jobs/[slug]/page");
    const newsModule = await import("@/app/(public)/news/[slug]/page");
    const localeNewsModule =
      await import("@/app/(public)/[locale]/news/[slug]/page");

    const baseJobMetadata = await jobsModule.generateMetadata(
      createAppRouterPageProps({
        params: {
          locale: "ja",
          slug: jobFixture.slug,
        },
        searchParams: {},
      }),
    );

    const localeJobMetadata = await localeJobsModule.generateMetadata(
      createAppRouterPageProps({
        params: {
          locale: "ja",
          slug: jobFixture.slug,
        },
        searchParams: {},
      }),
    );

    const baseNewsMetadata = await newsModule.generateMetadata(
      createAppRouterPageProps({
        params: {
          locale: "ja",
          slug: newsFixture.slug,
        },
        searchParams: {},
      }),
    );

    const localeNewsMetadata = await localeNewsModule.generateMetadata(
      createAppRouterPageProps({
        params: {
          locale: "ja",
          slug: newsFixture.slug,
        },
        searchParams: {},
      }),
    );

    expect(localeJobMetadata).toEqual(baseJobMetadata);
    expect(localeNewsMetadata).toEqual(baseNewsMetadata);
  }, 15_000);
});
