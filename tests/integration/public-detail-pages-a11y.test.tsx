import { screen, within } from "@testing-library/react";
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
          content: [
            { type: "text", text: "Doan mo dau gioi thieu noi dung bai viet." },
          ],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Doan tiep theo voi thong tin bo sung." },
          ],
        },
      ],
    },
    publishAt: null,
    updatedAt: new Date("2026-01-16T08:00:00.000Z"),
    category: {
      nameVN: "Tin cong ty",
      slug: "tin-cong-ty",
    },
    coverImage: null,
    ...overrides,
  };
}

function headingLevels(root: HTMLElement): number[] {
  return within(root)
    .getAllByRole("heading")
    .map((heading) => Number.parseInt(heading.tagName.replace("H", ""), 10));
}

describe("Public detail pages accessibility and heading order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.jobPost.findFirst.mockReset();
    prismaMock.newsPost.findFirst.mockReset();
  });

  it("keeps job detail heading levels ordered and exposes a single page heading", async () => {
    const fixture = publishedJobFixtures[0];
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(createJobRecord());

    const pageModule = await import("@/app/(public)/jobs/[slug]/page");
    const JobDetailPage = pageModule.default;

    const { container } = await renderAppRouterPage(JobDetailPage, {
      params: { slug: fixture.slug },
    });

    const headings = headingLevels(container);
    expect(headings).toEqual([1, 2, 2, 2, 2]);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Quay lai danh sach viec lam" }),
    ).toHaveAttribute("href", "/vi/jobs");
  }, 15_000);

  it("keeps news detail under a main landmark with a single top-level heading", async () => {
    const fixture = publishedNewsFixtures[0];
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(createNewsRecord());

    const pageModule = await import("@/app/(public)/news/[slug]/page");
    const NewsDetailPage = pageModule.default;

    const { container } = await renderAppRouterPage(NewsDetailPage, {
      params: { slug: fixture.slug },
    });

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(headingLevels(container)).toEqual([1]);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Quay lai trang tin tuc" }),
    ).toHaveAttribute("href", "/vi/news");
  }, 15_000);

  it("announces unavailable job detail state through a polite live region with one heading", async () => {
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(null);

    const pageModule = await import("@/app/(public)/jobs/[slug]/page");
    const JobDetailPage = pageModule.default;

    await renderAppRouterPage(JobDetailPage, {
      params: { slug: "missing-job" },
    });

    const unavailableTitle = screen.getByRole("heading", {
      level: 1,
      name: "Khong tim thay viec lam",
    });
    const unavailableRegion = unavailableTitle.closest("article");

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(unavailableRegion).toHaveAttribute("aria-live", "polite");
  }, 15_000);

  it("announces unavailable news detail state through a polite live region with one heading", async () => {
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(null);

    const pageModule = await import("@/app/(public)/news/[slug]/page");
    const NewsDetailPage = pageModule.default;

    await renderAppRouterPage(NewsDetailPage, {
      params: { slug: "missing-news" },
    });

    const unavailableTitle = screen.getByRole("heading", {
      level: 1,
      name: "Khong tim thay bai viet",
    });
    const unavailableRegion = unavailableTitle.closest("article");

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(unavailableRegion).toHaveAttribute("aria-live", "polite");
  }, 15_000);
});
