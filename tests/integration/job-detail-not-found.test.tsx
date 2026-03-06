import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { unpublishedJobFixtures } from "@/tests/fixtures/public-content";

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

describe("Job detail not-found behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a clear unavailable state for a missing slug", async () => {
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(null);

    const pageModule = await import("@/app/(public)/jobs/[slug]/page");
    const JobDetailPage = pageModule.default;

    await renderAppRouterPage(JobDetailPage, {
      params: { slug: "missing-job" },
    });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Khong tim thay viec lam",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tin tuyen dung ban tim khong ton tai hoac chua duoc cong khai.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Quay lai danh sach viec lam" }),
    ).toHaveAttribute("href", "/vi/jobs");
  }, 15_000);

  it("masks unpublished slug with unavailable state while preserving published-only query guard", async () => {
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(null);
    const unpublishedSlug = unpublishedJobFixtures[0].slug;

    const pageModule = await import("@/app/(public)/jobs/[slug]/page");
    const JobDetailPage = pageModule.default;

    await renderAppRouterPage(JobDetailPage, {
      params: { slug: unpublishedSlug },
    });

    expect(prismaMock.jobPost.findFirst).toHaveBeenCalledWith(
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
            expect.objectContaining({ slug: unpublishedSlug }),
          ]),
        }),
      }),
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Khong tim thay viec lam",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Quay lai danh sach viec lam" }),
    ).toHaveAttribute("href", "/vi/jobs");
  }, 15_000);

  it("localizes unavailable state and back navigation for locale routes", async () => {
    prismaMock.jobPost.findFirst.mockResolvedValueOnce(null);

    const pageModule = await import("@/app/(public)/[locale]/jobs/[slug]/page");
    const JobDetailPage = pageModule.default;

    await renderAppRouterPage(JobDetailPage, {
      params: { locale: "ja", slug: "missing-job" },
    });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "求人が見つかりません",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("指定の求人は存在しないか、公開されていません。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "求人一覧に戻る" }),
    ).toHaveAttribute("href", "/ja/jobs");
  }, 15_000);
});
