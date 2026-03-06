import { describe, expect, it } from "vitest";

import { resolveLocalizedContentBlock } from "@/lib/public-content/localized-blocks";

describe("resolveLocalizedContentBlock", () => {
  it("returns requested locale block when available", () => {
    const resolved = resolveLocalizedContentBlock(
      {
        vi: "Noi dung",
        ja: "Naiyou",
      },
      "vi",
      {
        blockName: "Job summary",
      },
    );

    expect(resolved).toEqual({
      requestedLocale: "vi",
      resolvedLocale: "vi",
      block: "Noi dung",
      fallbackNotice: null,
    });
  });

  it("falls back to paired locale when requested locale is unavailable", () => {
    const resolved = resolveLocalizedContentBlock(
      {
        vi: "Noi dung",
        ja: null,
      },
      "ja",
      {
        blockName: "News body",
      },
    );

    expect(resolved).toEqual({
      requestedLocale: "ja",
      resolvedLocale: "vi",
      block: "Noi dung",
      fallbackNotice:
        "News body wa Betonamugo de hyoji sarete imasu. Gokibou no gengo no content ga genzai arimasen.",
    });
  });

  it("treats empty localized copy as missing when isMissing is provided", () => {
    const resolved = resolveLocalizedContentBlock(
      {
        vi: "Noi dung",
        ja: "   ",
      },
      "ja",
      {
        blockName: "Job requirements",
        isMissing: (value) => value.trim().length === 0,
      },
    );

    expect(resolved).toEqual({
      requestedLocale: "ja",
      resolvedLocale: "vi",
      block: "Noi dung",
      fallbackNotice:
        "Job requirements wa Betonamugo de hyoji sarete imasu. Gokibou no gengo no content ga genzai arimasen.",
    });
  });

  it("falls back to first available locale when requested and paired fallback are unavailable", () => {
    const resolved = resolveLocalizedContentBlock(
      {
        vi: null,
        ja: "Naiyou",
      },
      "unknown-locale",
      {
        fallbackLocale: "vi",
        blockName: "Detail section",
      },
    );

    expect(resolved).toEqual({
      requestedLocale: "vi",
      resolvedLocale: "ja",
      block: "Naiyou",
      fallbackNotice:
        "Detail section dang duoc hien thi bang tieng Nhat vi noi dung cua ngon ngu ban chon hien khong kha dung.",
    });
  });

  it("throws when no localized block is available", () => {
    expect(() =>
      resolveLocalizedContentBlock(
        {
          vi: null,
          ja: null,
        },
        "vi",
      ),
    ).toThrow("No localized content blocks are available.");
  });
});
