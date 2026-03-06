import { screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  jobPost: {
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

function createAdminJobSummary(
  overrides: Partial<{
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED";
    sortWeight: number;
    isUrgent: boolean;
    publishAt: Date | null;
    scheduledAt: Date | null;
    updatedAt: Date;
    categoryName: string;
    prefectureNameJP: string | null;
    prefectureNameVN: string;
  }> = {},
) {
  return {
    id: overrides.id ?? "job-id-1",
    title: overrides.title ?? "Draft Role",
    slug: overrides.slug ?? "draft-role",
    status: overrides.status ?? "DRAFT",
    sortWeight: overrides.sortWeight ?? 120,
    isUrgent: overrides.isUrgent ?? false,
    publishAt: overrides.publishAt ?? null,
    scheduledAt: overrides.scheduledAt ?? null,
    updatedAt: overrides.updatedAt ?? new Date("2026-02-11T10:00:00.000Z"),
    category: {
      nameVN: overrides.categoryName ?? "Engineering",
    },
    prefecture: {
      nameJP: overrides.prefectureNameJP ?? "Tokyo",
      nameVN: overrides.prefectureNameVN ?? "Tokyo",
    },
  };
}

describe("Admin jobs page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.jobPost.findMany.mockReset();
  });

  it("uses deterministic sort-weight query ordering and renders lifecycle cues", async () => {
    prismaMock.jobPost.findMany.mockResolvedValueOnce([
      createAdminJobSummary({
        id: "job-draft",
        title: "Draft Role",
        slug: "draft-role",
        status: "DRAFT",
        sortWeight: 120,
      }),
      createAdminJobSummary({
        id: "job-scheduled",
        title: "Scheduled Role",
        slug: "scheduled-role",
        status: "SCHEDULED",
        sortWeight: 100,
        scheduledAt: new Date("2028-01-01T00:00:00.000Z"),
      }),
      createAdminJobSummary({
        id: "job-published",
        title: "Published Role",
        slug: "published-role",
        status: "PUBLISHED",
        sortWeight: 80,
        publishAt: new Date("2026-02-11T11:00:00.000Z"),
      }),
      createAdminJobSummary({
        id: "job-closed",
        title: "Closed Role",
        slug: "closed-role",
        status: "CLOSED",
        sortWeight: 10,
        publishAt: new Date("2026-01-20T08:00:00.000Z"),
      }),
    ]);

    const pageModule = await import("@/app/admin/jobs/page");
    const AdminJobsListPage = pageModule.default;

    await renderAppRouterPage(AdminJobsListPage);

    expect(prismaMock.jobPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { sortWeight: "desc" },
          { updatedAt: "desc" },
          { createdAt: "desc" },
        ],
      }),
    );
    expect(
      screen.getByRole("columnheader", { name: "Sort weight" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage draft and published job postings. Higher sort weight appears first.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create Job" })).toHaveAttribute(
      "href",
      "/admin/jobs/new",
    );

    const draftRow = screen.getByText("Draft Role").closest("tr");
    expect(draftRow).not.toBeNull();
    expect(
      within(draftRow as HTMLElement).getByText("120"),
    ).toBeInTheDocument();
    expect(
      within(draftRow as HTMLElement).getByText("Not published yet."),
    ).toBeInTheDocument();

    const scheduledRow = screen.getByText("Scheduled Role").closest("tr");
    expect(scheduledRow).not.toBeNull();
    expect(
      within(scheduledRow as HTMLElement).getByText("100"),
    ).toBeInTheDocument();
    expect(
      within(scheduledRow as HTMLElement).getByText(/Publishes on/),
    ).toBeInTheDocument();

    const publishedRow = screen.getByText("Published Role").closest("tr");
    expect(publishedRow).not.toBeNull();
    expect(
      within(publishedRow as HTMLElement).getByText(/Live since/),
    ).toBeInTheDocument();

    const closedRow = screen.getByText("Closed Role").closest("tr");
    expect(closedRow).not.toBeNull();
    expect(
      within(closedRow as HTMLElement).getByText(/Closed\. Last published/),
    ).toBeInTheDocument();
  });

  it("renders empty state when there are no jobs", async () => {
    prismaMock.jobPost.findMany.mockResolvedValueOnce([]);

    const pageModule = await import("@/app/admin/jobs/page");
    const AdminJobsListPage = pageModule.default;

    await renderAppRouterPage(AdminJobsListPage);

    expect(screen.getByText("No job posts yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create Job" })).toHaveAttribute(
      "href",
      "/admin/jobs/new",
    );
    expect(
      screen.queryByRole("link", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });
});
