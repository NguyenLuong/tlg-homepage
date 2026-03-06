import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { unpublishedNewsFixtures } from "@/tests/fixtures/public-content";

const prismaMock = vi.hoisted(() => ({
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

describe("News detail not-found behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a clear unavailable state for a missing slug", async () => {
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(null);

    const pageModule = await import("@/app/(public)/news/[slug]/page");
    const NewsDetailPage = pageModule.default;

    await renderAppRouterPage(NewsDetailPage, {
      params: { slug: "missing-news" },
    });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Khong tim thay bai viet",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Bai viet ban tim khong ton tai hoac chua duoc cong khai.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Quay lai trang tin tuc" }),
    ).toHaveAttribute("href", "/vi/news");
  }, 15_000);

  it("masks unpublished slug with unavailable state while preserving published-only query guard", async () => {
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(null);
    const unpublishedSlug = unpublishedNewsFixtures[0].slug;

    const pageModule = await import("@/app/(public)/news/[slug]/page");
    const NewsDetailPage = pageModule.default;

    await renderAppRouterPage(NewsDetailPage, {
      params: { slug: unpublishedSlug },
    });

    expect(prismaMock.newsPost.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          slug: unpublishedSlug,
          status: "PUBLISHED",
          OR: [{ publishAt: null }, { publishAt: { lte: expect.any(Date) } }],
        }),
      }),
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Khong tim thay bai viet",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Quay lai trang tin tuc" }),
    ).toHaveAttribute("href", "/vi/news");
  }, 15_000);

  it("localizes unavailable state and back navigation for locale routes", async () => {
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(null);

    const pageModule = await import("@/app/(public)/[locale]/news/[slug]/page");
    const NewsDetailPage = pageModule.default;

    await renderAppRouterPage(NewsDetailPage, {
      params: { locale: "ja", slug: "missing-news" },
    });

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "ニュースが見つかりません",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("指定のニュースは存在しないか、公開されていません。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "ニュース一覧に戻る" }),
    ).toHaveAttribute("href", "/ja/news");
  }, 15_000);
});
