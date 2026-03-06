import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  localizedJobMissingCopyFixtures,
  publishedJobFixtures,
} from "@/tests/fixtures/public-content";

const prismaMock = vi.hoisted(() => ({
  jobPost: {
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

describe("Job detail content hierarchy and fallback behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.jobPost.findFirst.mockReset();
  });

  it("renders a scannable hierarchy for description, requirements, benefits, and process blocks", async () => {
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(createJobRecord());

    const pageModule = await import("@/app/(public)/jobs/[slug]/page");
    const JobDetailPage = pageModule.default;

    await renderAppRouterPage(JobDetailPage, {
      params: { slug: publishedJobFixtures[0].slug },
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "Frontend Engineer" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
    expect(screen.getByText("25 - 35 trieu")).toBeInTheDocument();
    expect(screen.getByText("Mo ta cong viec chi tiet.")).toBeInTheDocument();
    expect(
      screen.getByText("Yeu cau kinh nghiem toi thieu 2 nam."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Phong van 2 vong va bai test nho."),
    ).toBeInTheDocument();

    const sectionHeadings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent?.trim());

    expect(sectionHeadings).toEqual([
      "Mo ta cong viec",
      "Yeu cau",
      "Quyen loi",
      "Quy trinh ung tuyen",
    ]);
  }, 15_000);

  it("uses locale fallback content and shows a fallback notice when selected locale copy is missing", async () => {
    const fixture = localizedJobMissingCopyFixtures[0];

    prismaMock.jobPost.findFirst.mockResolvedValueOnce(
      createJobRecord({
        slug: fixture.slug,
        title: "Frontend Engineer",
        benefits: [],
        descriptionRich: {
          vi: {
            type: "doc",
            content: [{ type: "paragraph", text: "Mo ta chi co tieng Viet" }],
          },
          ja: null,
        },
        requirementsRich: {
          vi: {
            type: "doc",
            content: [{ type: "paragraph", text: "Yeu cau chi co tieng Viet" }],
          },
          ja: null,
        },
        processRich: {
          vi: {
            type: "doc",
            content: [
              { type: "paragraph", text: "Quy trinh chi co tieng Viet" },
            ],
          },
          ja: null,
        },
      }),
    );

    const pageModule = await import("@/app/(public)/[locale]/jobs/[slug]/page");
    const JobDetailPage = pageModule.default;

    await renderAppRouterPage(JobDetailPage, {
      params: { locale: "ja", slug: fixture.slug },
    });

    expect(screen.getByText("Mo ta chi co tieng Viet")).toBeInTheDocument();
    expect(screen.getByText("Yeu cau chi co tieng Viet")).toBeInTheDocument();
    expect(screen.getByText("Quy trinh chi co tieng Viet")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Gokibou no gengo no content ga genzai arimasen|hien khong kha dung/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "求人一覧に戻る" }),
    ).toHaveAttribute("href", "/ja/jobs");
  }, 15_000);
});
