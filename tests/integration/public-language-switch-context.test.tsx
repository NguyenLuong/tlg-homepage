import { describe, expect, it } from "vitest";

import { switchPublicLocalePath } from "@/lib/i18n/public-locales";

describe("Public language switch context", () => {
  it("preserves jobs detail route context when switching locale", () => {
    const result = switchPublicLocalePath(
      "/vi/jobs/backend-engineer?page=2&pageSize=12&category=it",
      "ja",
    );

    expect(result).toBe(
      "/ja/jobs/backend-engineer?page=2&pageSize=12&category=it",
    );
  });

  it("preserves jobs listing route query context when switching locale", () => {
    const result = switchPublicLocalePath(
      "/ja/jobs?page=3&pageSize=20&sort=urgent&prefecture=tokyo&tag=frontend",
      "vi",
    );

    expect(result).toBe(
      "/vi/jobs?page=3&pageSize=20&sort=urgent&prefecture=tokyo&tag=frontend",
    );
  });

  it("preserves hash fragment together with query params", () => {
    const result = switchPublicLocalePath(
      "/ja/news?locale=ja&q=tokyo#latest",
      "vi",
    );

    expect(result).toBe("/vi/news?locale=ja&q=tokyo#latest");
  });

  it("localizes non-prefixed public route while keeping query context", () => {
    const result = switchPublicLocalePath("/about?source=footer", "ja");

    expect(result).toBe("/ja/about?source=footer");
  });
});
