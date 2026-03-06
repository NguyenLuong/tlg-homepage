import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { publishedNewsFixtures } from "@/tests/fixtures/public-content";

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

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    priority: _priority,
    ...props
  }: {
    src: string;
    alt: string;
    priority?: boolean;
  }) => <img src={src} alt={alt} {...props} />,
}));

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
    coverImage: {
      url: "https://example.com/cover.jpg",
      altText: "Anh bia su kien cong ty",
      width: 1200,
      height: 630,
    },
    ...overrides,
  };
}

describe("News detail reading layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.newsPost.findFirst.mockReset();
  });

  it("renders title, publish context, full body, media, and a back link to the news listing", async () => {
    const fixture = publishedNewsFixtures[0];
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(createNewsRecord());

    const pageModule = await import("@/app/(public)/news/[slug]/page");
    const NewsDetailPage = pageModule.default;

    await renderAppRouterPage(NewsDetailPage, {
      params: { slug: fixture.slug },
    });

    expect(
      screen.getByRole("heading", { level: 1, name: fixture.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tin cong ty")).toBeInTheDocument();
    expect(screen.getByText("Vua dang")).toBeInTheDocument();
    expect(
      screen.getByText("Doan mo dau gioi thieu noi dung bai viet."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Doan tiep theo voi thong tin bo sung."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Anh bia su kien cong ty" }),
    ).toHaveAttribute("src", "https://example.com/cover.jpg");
    expect(
      screen.getByRole("link", { name: "Quay lai trang tin tuc" }),
    ).toHaveAttribute("href", "/vi/news");
  }, 15_000);

  it("supports locale routes and omits media when cover image is unavailable", async () => {
    const fixture = publishedNewsFixtures[1];
    prismaMock.newsPost.findFirst.mockResolvedValueOnce(
      createNewsRecord({
        id: fixture.id,
        slug: fixture.slug,
        title: "TLG setsuritsu kinen",
        excerpt: "Seicho no ayumi to omona kinenbi.",
        contentRich: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Kiji zentai no naiyou" }],
            },
          ],
        },
        coverImage: null,
      }),
    );

    const pageModule = await import("@/app/(public)/[locale]/news/[slug]/page");
    const NewsDetailPage = pageModule.default;

    await renderAppRouterPage(NewsDetailPage, {
      params: { locale: "ja", slug: fixture.slug },
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "TLG setsuritsu kinen" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Kiji zentai no naiyou")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "ニュース一覧に戻る" }),
    ).toHaveAttribute("href", "/ja/news");
  }, 15_000);
});
