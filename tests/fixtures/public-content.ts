export type FixtureStatus =
  | "PUBLISHED"
  | "DRAFT"
  | "SCHEDULED"
  | "ARCHIVED"
  | "CLOSED";
export type FixtureLocale = "vi" | "ja";
export type FixtureAdminJobCreatePayload = {
  title: string;
  slug: string;
  locationPrefectureId: string;
  salaryText: string;
  benefits: string[];
  descriptionRich: Record<string, unknown>;
  heroImageId?: string;
};

export type FixtureAdminJobUpdatePayload = Partial<
  Omit<FixtureAdminJobCreatePayload, "locationPrefectureId" | "heroImageId"> & {
    locationPrefectureId: string;
    heroImageId: string | null;
  }
>;

export type FixtureAdminNewsCreatePayload = {
  title: string;
  contentRich: Record<string, unknown>;
  categoryId: string;
};

export type FixtureAdminNewsUpdatePayload =
  Partial<FixtureAdminNewsCreatePayload>;

export type FixtureSchedulePayload = {
  scheduledAt: string;
};

export type FixtureNewsItem = {
  id: string;
  slug: string;
  title: string;
  contentRich: Record<string, unknown>;
  status: FixtureStatus;
  publishAt: string | null;
};

export type FixtureJobItem = {
  id: string;
  slug: string;
  title: string;
  salaryText: string;
  benefits: string[];
  descriptionRich: Record<string, unknown>;
  requirementsRich: Record<string, unknown>;
  processRich: Record<string, unknown> | null;
  status: FixtureStatus;
  publishAt: string | null;
  heroImage: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
  prefecture: string;
};

export type FixtureLocalizedText = Record<FixtureLocale, string | null>;
export type FixtureLocalizedRichText = Record<
  FixtureLocale,
  Record<string, unknown> | null
>;
export type FixtureLocalizedStringList = Record<FixtureLocale, string[] | null>;

export type FixtureLocalizedNewsItem = FixtureNewsItem & {
  localized: {
    title: FixtureLocalizedText;
    contentRich: FixtureLocalizedRichText;
  };
};

export type FixtureLocalizedJobItem = FixtureJobItem & {
  localized: {
    title: FixtureLocalizedText;
    salaryText: FixtureLocalizedText;
    benefits: FixtureLocalizedStringList;
    descriptionRich: FixtureLocalizedRichText;
    requirementsRich: FixtureLocalizedRichText;
    processRich: FixtureLocalizedRichText;
  };
};

export type FixtureLocaleResolution<TItem> = {
  requestedLocale: FixtureLocale;
  resolvedLocale: FixtureLocale;
  usedFallback: boolean;
  item: TItem;
};

export const publishedNewsFixtures: FixtureNewsItem[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "tet-hoat-dong-cong-ty",
    title: "Hoat dong Tet cung TLG",
    contentRich: { type: "doc", content: [] },
    status: "PUBLISHED",
    publishAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "ky-niem-thanh-lap",
    title: "Ky niem thanh lap TLG",
    contentRich: { type: "doc", content: [] },
    status: "PUBLISHED",
    publishAt: "2026-01-20T08:00:00.000Z",
  },
];

export const unpublishedNewsFixtures: FixtureNewsItem[] = [
  {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "ke-hoach-mo-rong",
    title: "Ke hoach mo rong thi truong",
    contentRich: { type: "doc", content: [] },
    status: "DRAFT",
    publishAt: null,
  },
];

export const publishedJobFixtures: FixtureJobItem[] = [
  {
    id: "44444444-4444-4444-4444-444444444444",
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    salaryText: "25 - 35 trieu",
    benefits: ["Bao hiem day du", "Thuong theo hieu suat"],
    descriptionRich: { type: "doc", content: [] },
    requirementsRich: { type: "doc", content: [] },
    processRich: { type: "doc", content: [] },
    status: "PUBLISHED",
    publishAt: "2026-01-10T08:00:00.000Z",
    heroImage: {
      url: "https://res.cloudinary.com/example/image/upload/v1/frontend-hero.jpg",
      altText: "Frontend development workspace",
      width: 1200,
      height: 675,
    },
    prefecture: "Tokyo",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    slug: "backend-engineer",
    title: "Backend Engineer",
    salaryText: "30 - 40 trieu",
    benefits: ["Hybrid linh hoat", "Dao tao chuyen mon"],
    descriptionRich: { type: "doc", content: [] },
    requirementsRich: { type: "doc", content: [] },
    processRich: { type: "doc", content: [] },
    status: "PUBLISHED",
    publishAt: "2026-01-12T08:00:00.000Z",
    heroImage: {
      url: "https://res.cloudinary.com/example/image/upload/v1/backend-hero.jpg",
      altText: null,
      width: 1200,
      height: 675,
    },
    prefecture: "Osaka",
  },
];

export const unpublishedJobFixtures: FixtureJobItem[] = [
  {
    id: "66666666-6666-6666-6666-666666666666",
    slug: "sales-manager",
    title: "Sales Manager",
    salaryText: "35 - 45 trieu",
    benefits: ["Thuong KPI", "Xe dua don theo khu vuc"],
    descriptionRich: { type: "doc", content: [] },
    requirementsRich: { type: "doc", content: [] },
    processRich: null,
    status: "DRAFT",
    publishAt: null,
    heroImage: null,
    prefecture: "Kyoto",
  },
];

export const localizedPublishedNewsFixtures: FixtureLocalizedNewsItem[] = [
  {
    ...publishedNewsFixtures[0],
    localized: {
      title: {
        vi: "Hoat dong Tet cung TLG",
        ja: "TLG no oshogatsu ibento",
      },
      contentRich: {
        vi: {
          type: "doc",
          content: [{ type: "paragraph", text: "Noi dung tieng Viet" }],
        },
        ja: {
          type: "doc",
          content: [{ type: "paragraph", text: "Nihongo no honbun" }],
        },
      },
    },
  },
  {
    ...publishedNewsFixtures[1],
    localized: {
      title: {
        vi: "Ky niem thanh lap TLG",
        ja: "TLG setsuritsu kinen",
      },
      contentRich: {
        vi: {
          type: "doc",
          content: [{ type: "paragraph", text: "Noi dung bai viet day du" }],
        },
        ja: {
          type: "doc",
          content: [{ type: "paragraph", text: "Kiji zentai no naiyou" }],
        },
      },
    },
  },
];

export const localizedNewsMissingCopyFixtures: FixtureLocalizedNewsItem[] = [
  {
    ...publishedNewsFixtures[0],
    slug: "tet-hoat-dong-cong-ty-vi-only",
    localized: {
      title: {
        vi: "Hoat dong Tet cung TLG",
        ja: null,
      },
      contentRich: {
        vi: {
          type: "doc",
          content: [{ type: "paragraph", text: "Noi dung chi co tieng Viet" }],
        },
        ja: null,
      },
    },
  },
];

export const localizedPublishedJobFixtures: FixtureLocalizedJobItem[] = [
  {
    ...publishedJobFixtures[0],
    localized: {
      title: {
        vi: "Frontend Engineer",
        ja: "Furontoendo enjinia",
      },
      salaryText: {
        vi: "25 - 35 trieu",
        ja: "2500 - 3500 man VND soutou",
      },
      benefits: {
        vi: ["Bao hiem day du", "Thuong theo hieu suat"],
        ja: ["Shakai hoken kanbi", "Seika bonus"],
      },
      descriptionRich: {
        vi: {
          type: "doc",
          content: [{ type: "paragraph", text: "Mo ta cong viec tieng Viet" }],
        },
        ja: {
          type: "doc",
          content: [{ type: "paragraph", text: "Shigoto setsumei" }],
        },
      },
      requirementsRich: {
        vi: {
          type: "doc",
          content: [{ type: "paragraph", text: "Yeu cau ung vien" }],
        },
        ja: {
          type: "doc",
          content: [{ type: "paragraph", text: "Ouboshikaku" }],
        },
      },
      processRich: {
        vi: {
          type: "doc",
          content: [{ type: "paragraph", text: "Quy trinh ung tuyen" }],
        },
        ja: {
          type: "doc",
          content: [{ type: "paragraph", text: "Senkou purosesu" }],
        },
      },
    },
  },
  {
    ...publishedJobFixtures[1],
    localized: {
      title: {
        vi: "Backend Engineer",
        ja: "Bakkuendo enjinia",
      },
      salaryText: {
        vi: "30 - 40 trieu",
        ja: "3000 - 4000 man VND soutou",
      },
      benefits: {
        vi: ["Hybrid linh hoat", "Dao tao chuyen mon"],
        ja: ["Hiburiddo kinmu", "Senmon kenshuu"],
      },
      descriptionRich: {
        vi: {
          type: "doc",
          content: [{ type: "paragraph", text: "Mo ta cong viec backend" }],
        },
        ja: {
          type: "doc",
          content: [{ type: "paragraph", text: "Backend shigoto no setsumei" }],
        },
      },
      requirementsRich: {
        vi: {
          type: "doc",
          content: [
            { type: "paragraph", text: "Kinh nghiem backend can thiet" },
          ],
        },
        ja: {
          type: "doc",
          content: [{ type: "paragraph", text: "Hitsuyou na backend keiken" }],
        },
      },
      processRich: {
        vi: {
          type: "doc",
          content: [{ type: "paragraph", text: "Phong van 2 vong" }],
        },
        ja: {
          type: "doc",
          content: [{ type: "paragraph", text: "Niji mensetsu purosesu" }],
        },
      },
    },
  },
];

export const localizedJobMissingCopyFixtures: FixtureLocalizedJobItem[] = [
  {
    ...publishedJobFixtures[0],
    slug: "frontend-engineer-vi-only",
    localized: {
      title: {
        vi: "Frontend Engineer",
        ja: null,
      },
      salaryText: {
        vi: "25 - 35 trieu",
        ja: null,
      },
      benefits: {
        vi: ["Bao hiem day du", "Thuong theo hieu suat"],
        ja: null,
      },
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
          content: [{ type: "paragraph", text: "Quy trinh chi co tieng Viet" }],
        },
        ja: null,
      },
    },
  },
];

const ADMIN_FIXTURE_IDS = {
  prefectureId: "77777777-7777-4777-8777-777777777777",
  newsCategoryId: "99999999-9999-4999-8999-999999999999",
  heroImageId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  coverImageId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
} as const;

export const defaultAdminJobCreatePayloadFixture: FixtureAdminJobCreatePayload =
  {
    title: "Senior Fullstack Engineer",
    slug: "senior-fullstack-engineer",
    locationPrefectureId: ADMIN_FIXTURE_IDS.prefectureId,
    salaryText: "40 - 55 trieu",
    benefits: ["Bao hiem day du", "Lam viec hybrid", "Thuong thanh tich"],
    descriptionRich: {
      type: "doc",
      content: [{ type: "paragraph", text: "Mo ta cong viec fullstack." }],
    },
    heroImageId: ADMIN_FIXTURE_IDS.heroImageId,
  };

export const defaultAdminJobUpdatePayloadFixture: FixtureAdminJobUpdatePayload =
  {
    title: "Senior Fullstack Engineer (Updated)",
    slug: "senior-fullstack-engineer-updated",
    salaryText: "45 - 60 triệu",
    benefits: ["Bảo hiểm đầy đủ", "Thưởng theo hiệu suất"],
    descriptionRich: {
      type: "doc",
      content: [{ type: "paragraph", text: "Mô tả công việc đã cập nhật." }],
    },
    heroImageId: ADMIN_FIXTURE_IDS.heroImageId,
  };

export const defaultAdminNewsCreatePayloadFixture: FixtureAdminNewsCreatePayload =
  {
    title: "Thông báo lịch nghỉ Tết",
    contentRich: {
      type: "doc",
      content: [
        { type: "paragraph", text: "Nội dung thông báo lịch nghỉ Tết." },
      ],
    },
    categoryId: ADMIN_FIXTURE_IDS.newsCategoryId,
  };

export const defaultAdminNewsUpdatePayloadFixture: FixtureAdminNewsUpdatePayload =
  {
    title: "Thông báo lịch nghỉ Tết (Cập nhật)",
    contentRich: {
      type: "doc",
      content: [{ type: "paragraph", text: "Nội dung thông báo đã cập nhật." }],
    },
    categoryId: ADMIN_FIXTURE_IDS.newsCategoryId,
  };

export function createAdminJobCreatePayloadFixture(
  overrides: Partial<FixtureAdminJobCreatePayload> = {},
): FixtureAdminJobCreatePayload {
  return {
    ...defaultAdminJobCreatePayloadFixture,
    ...overrides,
  };
}

export function createAdminJobUpdatePayloadFixture(
  overrides: FixtureAdminJobUpdatePayload = {},
): FixtureAdminJobUpdatePayload {
  return {
    ...defaultAdminJobUpdatePayloadFixture,
    ...overrides,
  };
}

export function createAdminNewsCreatePayloadFixture(
  overrides: Partial<FixtureAdminNewsCreatePayload> = {},
): FixtureAdminNewsCreatePayload {
  return {
    ...defaultAdminNewsCreatePayloadFixture,
    ...overrides,
  };
}

export function createAdminNewsUpdatePayloadFixture(
  overrides: FixtureAdminNewsUpdatePayload = {},
): FixtureAdminNewsUpdatePayload {
  return {
    ...defaultAdminNewsUpdatePayloadFixture,
    ...overrides,
  };
}

export function createSchedulePayloadFixture(
  scheduledAt = "2027-02-01T09:00:00.000Z",
): FixtureSchedulePayload {
  return { scheduledAt };
}

function getFallbackLocale(locale: FixtureLocale): FixtureLocale {
  return locale === "vi" ? "ja" : "vi";
}

export function resolveLocalizedNewsFixture(
  item: FixtureLocalizedNewsItem,
  locale: FixtureLocale,
): FixtureLocaleResolution<FixtureNewsItem> {
  const fallbackLocale = getFallbackLocale(locale);
  const resolvedLocale = item.localized.title[locale] ? locale : fallbackLocale;
  const usedFallback = resolvedLocale !== locale;

  return {
    requestedLocale: locale,
    resolvedLocale,
    usedFallback,
    item: {
      ...item,
      title: item.localized.title[resolvedLocale] ?? item.title,
      contentRich:
        item.localized.contentRich[resolvedLocale] ?? item.contentRich,
    },
  };
}

export function resolveLocalizedJobFixture(
  item: FixtureLocalizedJobItem,
  locale: FixtureLocale,
): FixtureLocaleResolution<FixtureJobItem> {
  const fallbackLocale = getFallbackLocale(locale);
  const resolvedLocale = item.localized.title[locale] ? locale : fallbackLocale;
  const usedFallback = resolvedLocale !== locale;

  return {
    requestedLocale: locale,
    resolvedLocale,
    usedFallback,
    item: {
      ...item,
      title: item.localized.title[resolvedLocale] ?? item.title,
      salaryText: item.localized.salaryText[resolvedLocale] ?? item.salaryText,
      benefits: item.localized.benefits[resolvedLocale] ?? item.benefits,
      descriptionRich:
        item.localized.descriptionRich[resolvedLocale] ?? item.descriptionRich,
      requirementsRich:
        item.localized.requirementsRich[resolvedLocale] ??
        item.requirementsRich,
      processRich:
        item.localized.processRich[resolvedLocale] ?? item.processRich,
    },
  };
}
