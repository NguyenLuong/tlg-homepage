import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { publishedJobFixtures } from "@/tests/fixtures/public-content";

const prismaMock = vi.hoisted(() => ({
  jobPost: {
    findMany: vi.fn(async () => []),
  },
  newsPost: {
    findMany: vi.fn(async () => []),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/ja",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/public-content/jobs-preview", () => ({
  getHomeJobsPreview: vi.fn(async () => publishedJobFixtures),
}));

async function renderJapaneseHomepage() {
  const pageModule = await import("@/app/(public)/[locale]/page");
  const layoutModule = await import("@/app/(public)/layout");

  const pageResult = pageModule.default({
    params: Promise.resolve({ locale: "ja" }),
  });
  const pageElement =
    pageResult instanceof Promise ? await pageResult : pageResult;

  const layoutResult = layoutModule.default({
    children: pageElement,
    params: Promise.resolve({ locale: "ja" }),
  });
  const layoutElement =
    layoutResult instanceof Promise ? await layoutResult : layoutResult;

  render(layoutElement);
}

describe("JP homepage trust sections", () => {
  it("renders company introduction trust block", async () => {
    await renderJapaneseHomepage();

    const aboutSection = document.getElementById("about");
    expect(aboutSection).toBeInTheDocument();
    expect(
      within(aboutSection as HTMLElement).getByRole("heading", { level: 2 }),
    ).toBeInTheDocument();
  });
});
