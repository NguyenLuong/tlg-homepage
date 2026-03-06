import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (operations: Array<Promise<unknown>>) =>
    Promise.all(operations),
  ),
  jobPost: {
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  jobCategory: {
    findMany: vi.fn(),
  },
  prefecture: {
    findMany: vi.fn(),
  },
  tag: {
    findMany: vi.fn(),
  },
  page: {
    findFirst: vi.fn(async () => null),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function createListJobRecord(
  overrides: Partial<{
    id: string;
    title: string;
    slug: string;
    salaryText: string;
    employmentType: string;
    isUrgent: boolean;
    publishAt: Date | null;
    categoryName: string;
    categorySlug: string;
    prefectureNameVN: string;
    prefectureNameJP: string | null;
    prefectureCode: string;
    tags: Array<{ id: string; nameVN: string; slug: string }>;
  }> = {},
) {
  const tags = overrides.tags ?? [
    { id: "tag-fe", nameVN: "Frontend", slug: "frontend" },
  ];

  return {
    id: overrides.id ?? "job-frontend",
    title: overrides.title ?? "Frontend Engineer",
    slug: overrides.slug ?? "frontend-engineer",
    salaryText: overrides.salaryText ?? "25 - 35 triệu",
    benefits: ["Bao hiem day du"],
    publishAt: overrides.publishAt ?? new Date("2026-01-10T08:00:00.000Z"),
    employmentType: overrides.employmentType ?? "FULL_TIME",
    isUrgent: overrides.isUrgent ?? false,
    category: {
      id: "cat-eng",
      nameVN: overrides.categoryName ?? "Engineering",
      slug: overrides.categorySlug ?? "engineering",
    },
    prefecture: {
      id: "pref-tokyo",
      code: overrides.prefectureCode ?? "tokyo",
      nameVN: overrides.prefectureNameVN ?? "Tokyo",
      nameJP: overrides.prefectureNameJP ?? "Toukyou",
    },
    jobPostTags: tags.map((tag) => ({
      tag,
    })),
  };
}

function createDetailJobRecord(
  overrides: Partial<{
    slug: string;
    title: string;
  }> = {},
) {
  return {
    id: "job-detail-1",
    title: overrides.title ?? "Frontend Engineer",
    slug: overrides.slug ?? "frontend-engineer",
    salaryText: "25 - 35 triệu",
    benefits: ["Bao hiem day du", "Thuong theo hieu suat"],
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
    updatedAt: new Date("2026-01-11T08:00:00.000Z"),
    category: {
      nameVN: "Engineering",
      slug: "engineering",
    },
    prefecture: {
      code: "tokyo",
      nameVN: "Tokyo",
      nameJP: "Toukyou",
    },
    heroImage: null,
    jobPostTags: [],
  };
}

describe("Jobs listing page integration coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.jobPost.count.mockReset();
    prismaMock.jobPost.findMany.mockReset();
    prismaMock.jobPost.findFirst.mockReset();
    prismaMock.jobCategory.findMany.mockReset();
    prismaMock.prefecture.findMany.mockReset();
    prismaMock.tag.findMany.mockReset();
  });

  it("renders published job summaries and supports list-detail-list continuity", async () => {
    const firstJob = createListJobRecord();
    const secondJob = createListJobRecord({
      id: "job-backend",
      title: "Backend Engineer",
      slug: "backend-engineer",
      salaryText: "30 - 40 triệu",
      tags: [{ id: "tag-be", nameVN: "Backend", slug: "backend" }],
    });

    prismaMock.jobPost.count.mockResolvedValueOnce(2);
    prismaMock.jobPost.findMany.mockResolvedValueOnce([firstJob, secondJob]);
    prismaMock.jobCategory.findMany.mockResolvedValueOnce([]);
    prismaMock.prefecture.findMany.mockResolvedValueOnce([]);
    prismaMock.tag.findMany.mockResolvedValueOnce([]);

    const listPageModule = await import("@/app/(public)/jobs/page");
    const JobsListPage = listPageModule.default;

    await renderAppRouterPage(JobsListPage, {
      params: {},
      searchParams: {
        page: "2",
        pageSize: "20",
        sort: "urgent",
        prefecture: "tokyo",
        category: "engineering",
        tag: "frontend",
      },
    });

    expect(
      screen.getByRole("heading", { level: 2, name: "Cơ hội đang tuyển" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("25 - 35 triệu")).toBeInTheDocument();
    expect(screen.getByText("30 - 40 triệu")).toBeInTheDocument();
    expect(screen.getAllByText("Hình thức: FULL_TIME")).toHaveLength(2);

    const titleLink = screen.getByRole("link", { name: "Frontend Engineer" });
    expect(titleLink).toHaveAttribute(
      "href",
      "/vi/jobs/frontend-engineer?page=2&pageSize=20&prefecture=tokyo&category=engineering&tag=frontend&sort=urgent",
    );

    const detailCta = screen.getAllByRole("link", { name: "Xem chi tiết" })[0];
    expect(detailCta).toHaveAttribute(
      "href",
      "/vi/jobs/frontend-engineer?page=2&pageSize=20&prefecture=tokyo&category=engineering&tag=frontend&sort=urgent",
    );

    prismaMock.jobPost.findFirst.mockResolvedValueOnce(
      createDetailJobRecord({
        slug: "frontend-engineer",
        title: "Frontend Engineer",
      }),
    );

    const detailPageModule = await import("@/app/(public)/jobs/[slug]/page");
    const JobDetailPage = detailPageModule.default;

    await renderAppRouterPage(JobDetailPage, {
      params: { slug: "frontend-engineer" },
      searchParams: {
        page: "2",
        pageSize: "20",
        sort: "urgent",
        prefecture: "tokyo",
        category: "engineering",
        tag: "frontend",
      },
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "Frontend Engineer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Quay lai danh sach viec lam" }),
    ).toHaveAttribute(
      "href",
      "/vi/jobs?page=2&pageSize=20&prefecture=tokyo&category=engineering&tag=frontend&sort=urgent",
    );
  }, 15_000);

  it("enforces published-only visibility and manual ordering for public jobs list", async () => {
    const topPriorityJob = createListJobRecord({
      id: "job-priority",
      title: "Priority Engineer",
      slug: "priority-engineer",
    });
    const secondPriorityJob = createListJobRecord({
      id: "job-secondary",
      title: "Secondary Engineer",
      slug: "secondary-engineer",
    });

    prismaMock.jobPost.count.mockResolvedValueOnce(2);
    prismaMock.jobPost.findMany.mockResolvedValueOnce([
      topPriorityJob,
      secondPriorityJob,
    ]);
    prismaMock.jobCategory.findMany.mockResolvedValueOnce([]);
    prismaMock.prefecture.findMany.mockResolvedValueOnce([]);
    prismaMock.tag.findMany.mockResolvedValueOnce([]);

    const pageModule = await import("@/app/(public)/jobs/page");
    const JobsListPage = pageModule.default;

    await renderAppRouterPage(JobsListPage, {
      params: {},
      searchParams: {
        sort: "manual",
      },
    });

    expect(prismaMock.jobPost.count).toHaveBeenCalledOnce();
    expect(prismaMock.jobPost.findMany).toHaveBeenCalledOnce();

    expect(prismaMock.jobPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              AND: expect.arrayContaining([
                expect.objectContaining({ status: "PUBLISHED" }),
                expect.objectContaining({
                  OR: [
                    { publishAt: null },
                    { publishAt: { lte: expect.any(Date) } },
                  ],
                }),
              ]),
            }),
          ]),
        }),
        orderBy: [
          { sortWeight: "desc" },
          { publishAt: "desc" },
          { createdAt: "desc" },
        ],
      }),
    );

    const titleLinks = screen.getAllByRole("link", { name: /Engineer$/ });
    expect(titleLinks[0]).toHaveTextContent("Priority Engineer");
    expect(titleLinks[0]).toHaveAttribute(
      "href",
      "/vi/jobs/priority-engineer?page=1&pageSize=10&sort=manual",
    );
    expect(titleLinks[1]).toHaveTextContent("Secondary Engineer");
  }, 15_000);

  it("renders a clear empty state when no published jobs are available", async () => {
    prismaMock.jobPost.count.mockResolvedValueOnce(0);
    prismaMock.jobPost.findMany.mockResolvedValueOnce([]);
    prismaMock.jobCategory.findMany.mockResolvedValueOnce([]);
    prismaMock.prefecture.findMany.mockResolvedValueOnce([]);
    prismaMock.tag.findMany.mockResolvedValueOnce([]);

    const pageModule = await import("@/app/(public)/jobs/page");
    const JobsListPage = pageModule.default;

    await renderAppRouterPage(JobsListPage, {
      params: {},
      searchParams: {},
    });

    expect(
      screen.getByText("Đang hiển thị 0-0 trên tổng 0 việc làm"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Không có việc làm công khai phù hợp bộ lọc hiện tại."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Xem chi tiết" }),
    ).not.toBeInTheDocument();
  }, 15_000);
});
