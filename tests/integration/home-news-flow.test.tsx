import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(async (queries: Array<Promise<unknown>>) =>
    Promise.all(queries),
  ),
  newsPost: {
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  newsCategory: {
    findMany: vi.fn(),
  },
  jobPost: {
    findMany: vi.fn(async () => []),
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

vi.mock("next/navigation", () => ({
  usePathname: () => "/vi",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/public-content/jobs-preview", () => ({
  getHomeJobsPreview: vi.fn(async () => []),
}));

describe("Homepage news flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets users navigate from homepage news section to list and open detail", async () => {
    prismaMock.newsPost.findMany.mockResolvedValueOnce([
      {
        id: "11111111-1111-1111-1111-111111111111",
        title: "Hoat dong Tet cung TLG",
        slug: "tet-hoat-dong-cong-ty",
        publishAt: new Date("2026-01-15T08:00:00.000Z"),
      },
    ]);

    prismaMock.newsPost.count.mockResolvedValueOnce(1);
    prismaMock.newsPost.findMany.mockResolvedValueOnce([
      {
        id: "11111111-1111-1111-1111-111111111111",
        title: "Hoat dong Tet cung TLG",
        slug: "tet-hoat-dong-cong-ty",
        publishAt: new Date("2026-01-15T08:00:00.000Z"),
        category: {
          nameVN: "Noi bo",
          nameJA: null,
          slug: "noi-bo",
        },
      },
    ]);

    prismaMock.newsCategory.findMany.mockResolvedValueOnce([
      {
        id: "99999999-9999-9999-9999-999999999999",
        nameVN: "Noi bo",
        slug: "noi-bo",
      },
    ]);

    prismaMock.newsPost.findFirst.mockResolvedValueOnce({
      id: "11111111-1111-1111-1111-111111111111",
      title: "Hoat dong Tet cung TLG",
      slug: "tet-hoat-dong-cong-ty",
      contentRich: { html: "<p>Cap nhat noi dung chi tiet.</p>" },
      publishAt: new Date("2026-01-15T08:00:00.000Z"),
      updatedAt: new Date("2026-01-16T08:00:00.000Z"),
      category: {
        nameVN: "Noi bo",
        nameJA: null,
        slug: "noi-bo",
      },
    });

    const homePageModule = await import("@/app/(public)/[locale]/page");
    const homePageResult = homePageModule.default({
      params: Promise.resolve({ locale: "vi" }),
    });
    const homePageElement =
      homePageResult instanceof Promise ? await homePageResult : homePageResult;

    render(homePageElement);

    const homepageNewsCta = screen.getByRole("link", {
      name: /tin tức|news/i,
    });
    expect(homepageNewsCta).toHaveAttribute("href", "/vi/news");
    expect(
      screen.getByRole("link", { name: "Hoat dong Tet cung TLG" }),
    ).toHaveAttribute("href", "/vi/news/tet-hoat-dong-cong-ty");

    const newsListModule = await import("@/app/(public)/[locale]/news/page");
    const newsListResult = newsListModule.default({
      params: Promise.resolve({ locale: "vi" }),
      searchParams: Promise.resolve({}),
    });
    const newsListElement =
      newsListResult instanceof Promise ? await newsListResult : newsListResult;

    const newsListRender = render(newsListElement);
    const detailLink = within(newsListRender.container).getByRole("link", {
      name: "Hoat dong Tet cung TLG",
    });
    expect(detailLink).toHaveAttribute(
      "href",
      "/vi/news/tet-hoat-dong-cong-ty",
    );

    const newsDetailModule =
      await import("@/app/(public)/[locale]/news/[slug]/page");
    const newsDetailResult = newsDetailModule.default({
      params: Promise.resolve({ locale: "vi", slug: "tet-hoat-dong-cong-ty" }),
      searchParams: Promise.resolve({}),
    });
    const newsDetailElement =
      newsDetailResult instanceof Promise
        ? await newsDetailResult
        : newsDetailResult;

    render(newsDetailElement);

    expect(
      screen.getByRole("heading", { name: "Hoat dong Tet cung TLG", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cap nhat noi dung chi tiet.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /quay lại trang tin tức|quay lai trang tin tuc/i,
      }),
    ).toHaveAttribute("href", "/vi/news");
  });

  it("keeps public homepage, list, and detail visibility in sync after admin updates", async () => {
    type MockNewsState = {
      id: string;
      title: string;
      slug: string;
      status: "PUBLISHED" | "DRAFT";
      publishAt: Date | null;
      contentText: string;
      updatedAt: Date;
    };

    const now = new Date("2026-02-01T12:00:00.000Z");

    const isPubliclyVisible = (item: MockNewsState): boolean =>
      item.status === "PUBLISHED" &&
      (item.publishAt === null || item.publishAt <= now);

    const mapToCategoryRecord = (item: MockNewsState) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      publishAt: item.publishAt,
      category: {
        nameVN: "Noi bo",
        nameJA: null,
        slug: "noi-bo",
      },
    });

    const mapToDetailRecord = (item: MockNewsState) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      contentRich: { html: `<p>${item.contentText}</p>` },
      publishAt: item.publishAt,
      updatedAt: item.updatedAt,
      category: {
        nameVN: "Noi bo",
        nameJA: null,
        slug: "noi-bo",
      },
    });

    let state: MockNewsState[] = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        title: "Hoat dong Tet cung TLG",
        slug: "tet-hoat-dong-cong-ty",
        status: "PUBLISHED",
        publishAt: new Date("2026-01-15T08:00:00.000Z"),
        contentText: "Noi dung truoc khi cap nhat.",
        updatedAt: new Date("2026-01-16T08:00:00.000Z"),
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        title: "Ky niem thanh lap TLG",
        slug: "ky-niem-thanh-lap",
        status: "PUBLISHED",
        publishAt: new Date("2026-01-20T08:00:00.000Z"),
        contentText: "Noi dung ban dau.",
        updatedAt: new Date("2026-01-21T08:00:00.000Z"),
      },
    ];

    prismaMock.newsPost.findMany.mockImplementation(
      async (args?: { select?: Record<string, unknown> }) => {
        const visible = state.filter(isPubliclyVisible);
        const select = args?.select ?? {};

        if ("category" in select) {
          return visible.map(mapToCategoryRecord);
        }

        return visible.map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          publishAt: item.publishAt,
        }));
      },
    );

    prismaMock.newsPost.count.mockImplementation(
      async () => state.filter(isPubliclyVisible).length,
    );

    prismaMock.newsPost.findFirst.mockImplementation(
      async (args?: { where?: { slug?: string } }) => {
        const slug = args?.where?.slug ?? "";
        const found = state.find((item) => item.slug === slug);
        if (!found || !isPubliclyVisible(found)) {
          return null;
        }

        return mapToDetailRecord(found);
      },
    );

    prismaMock.newsCategory.findMany.mockResolvedValue([
      {
        id: "99999999-9999-9999-9999-999999999999",
        nameVN: "Noi bo",
        slug: "noi-bo",
      },
    ]);

    const homePageModule = await import("@/app/(public)/[locale]/page");
    const newsListModule = await import("@/app/(public)/[locale]/news/page");
    const newsDetailModule =
      await import("@/app/(public)/[locale]/news/[slug]/page");

    const initialHomeResult = homePageModule.default({
      params: Promise.resolve({ locale: "vi" }),
    });
    const initialHomeElement =
      initialHomeResult instanceof Promise
        ? await initialHomeResult
        : initialHomeResult;
    const initialHomeRender = render(initialHomeElement);

    expect(
      screen.getByRole("link", { name: "Hoat dong Tet cung TLG" }),
    ).toHaveAttribute("href", "/vi/news/tet-hoat-dong-cong-ty");
    initialHomeRender.unmount();

    state = [
      {
        ...state[0],
        status: "DRAFT",
        publishAt: null,
      },
      {
        ...state[1],
        title: "Ky niem thanh lap TLG 2026",
        slug: "ky-niem-thanh-lap-2026",
        contentText: "Noi dung sau khi admin cap nhat va cong khai.",
        updatedAt: new Date("2026-02-01T08:00:00.000Z"),
      },
    ];

    const updatedHomeResult = homePageModule.default({
      params: Promise.resolve({ locale: "vi" }),
    });
    const updatedHomeElement =
      updatedHomeResult instanceof Promise
        ? await updatedHomeResult
        : updatedHomeResult;
    const updatedHomeRender = render(updatedHomeElement);

    expect(
      screen.queryByRole("link", { name: "Hoat dong Tet cung TLG" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ky niem thanh lap TLG 2026" }),
    ).toHaveAttribute("href", "/vi/news/ky-niem-thanh-lap-2026");
    updatedHomeRender.unmount();

    const newsListResult = newsListModule.default({
      params: Promise.resolve({ locale: "vi" }),
      searchParams: Promise.resolve({}),
    });
    const newsListElement =
      newsListResult instanceof Promise ? await newsListResult : newsListResult;
    const newsListRender = render(newsListElement);

    expect(
      screen.queryByRole("link", { name: "Hoat dong Tet cung TLG" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ky niem thanh lap TLG 2026" }),
    ).toHaveAttribute("href", "/vi/news/ky-niem-thanh-lap-2026");
    newsListRender.unmount();

    const staleDetailResult = newsDetailModule.default({
      params: Promise.resolve({ locale: "vi", slug: "tet-hoat-dong-cong-ty" }),
      searchParams: Promise.resolve({}),
    });
    const staleDetailElement =
      staleDetailResult instanceof Promise
        ? await staleDetailResult
        : staleDetailResult;
    const staleDetailRender = render(staleDetailElement);

    expect(
      screen.getByText(/không tìm thấy bài viết|khong tim thay bai viet/i),
    ).toBeInTheDocument();
    staleDetailRender.unmount();

    const updatedDetailResult = newsDetailModule.default({
      params: Promise.resolve({ locale: "vi", slug: "ky-niem-thanh-lap-2026" }),
      searchParams: Promise.resolve({}),
    });
    const updatedDetailElement =
      updatedDetailResult instanceof Promise
        ? await updatedDetailResult
        : updatedDetailResult;
    render(updatedDetailElement);

    expect(
      screen.getByRole("heading", {
        name: "Ky niem thanh lap TLG 2026",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Noi dung sau khi admin cap nhat va cong khai."),
    ).toBeInTheDocument();
  });
});
