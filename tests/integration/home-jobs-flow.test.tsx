import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { publishedJobFixtures } from "@/tests/fixtures/public-content";

const homepageJobPreviewFixtures = [
  ...publishedJobFixtures.map((job) => ({
    ...job,
    heroImage: {
      url: "https://res.cloudinary.com/example/image/upload/v1/job-hero.jpg",
      altText: null,
      width: 1200,
      height: 675,
    },
    prefecture: "Tokyo",
  })),
  {
    id: "77777777-7777-7777-7777-777777777777",
    slug: "qa-engineer",
    title: "QA Engineer",
    salaryText: "22 - 30 trieu",
    benefits: ["Bao hiem day du"],
    descriptionRich: { type: "doc", content: [] },
    requirementsRich: { type: "doc", content: [] },
    processRich: { type: "doc", content: [] },
    status: "PUBLISHED" as const,
    publishAt: "2026-01-13T08:00:00.000Z",
    heroImage: null,
    prefecture: "Osaka",
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    slug: "devops-engineer",
    title: "DevOps Engineer",
    salaryText: "32 - 42 trieu",
    benefits: ["Phu cap chung chi"],
    descriptionRich: { type: "doc", content: [] },
    requirementsRich: { type: "doc", content: [] },
    processRich: { type: "doc", content: [] },
    status: "PUBLISHED" as const,
    publishAt: "2026-01-14T08:00:00.000Z",
    heroImage: {
      url: "https://res.cloudinary.com/example/image/upload/v1/devops-hero.jpg",
      altText: "DevOps workspace",
      width: 1200,
      height: 675,
    },
    prefecture: "Yokohama",
  },
];

const prismaMock = vi.hoisted(() => ({
  newsPost: {
    findMany: vi.fn(async () => []),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
  prisma: prismaMock,
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
  getHomeJobsPreview: vi.fn(async () => homepageJobPreviewFixtures),
}));

async function renderHomepage() {
  const pageModule = await import("@/app/(public)/[locale]/page");
  const homePage = pageModule.default;
  const maybeElement = homePage({
    params: Promise.resolve({ locale: "vi" }),
  });
  const element =
    maybeElement instanceof Promise ? await maybeElement : maybeElement;

  render(element);
}

describe("Homepage jobs preview flow", () => {
  it("shows up to 3 published jobs and links Xem them CTA to jobs list", async () => {
    await renderHomepage();

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("QA Engineer")).toBeInTheDocument();
    expect(screen.queryByText("DevOps Engineer")).not.toBeInTheDocument();

    const viewMoreLink = screen.getByRole("link", { name: /xem thêm/i });
    expect(viewMoreLink).toHaveAttribute("href", "/vi/jobs");
  });
});
