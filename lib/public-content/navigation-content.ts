import type { PublicLocale } from "@/lib/i18n/public-locales";

export type PublicNavigationKey =
  | "home"
  | "about"
  | "achievements"
  | "news"
  | "jobs";

export type PublicNavigationItem = {
  key: PublicNavigationKey;
  href: string;
  labelVI: string;
  labelJP: string;
  position: number;
  visible: boolean;
};

export type LocalizedPublicNavigationItem = {
  key: PublicNavigationKey;
  href: string;
  label: string;
  position: number;
};

export type PublicHeaderContent = {
  languageSwitcher: {
    label: string;
    switchTo: string;
    ariaLabel: string;
  };
};

export type PublicFooterContactItem = {
  label: string;
  value: string;
  href: string;
};

export type PublicFooterSocialLink = {
  label: string;
  href: string;
};

export type PublicFooterContent = {
  aboutLabel: string;
  summary: string;
  quickLinksLabel: string;
  contactLabel: string;
  contactItems: ReadonlyArray<PublicFooterContactItem>;
  socialLinksLabel: string;
  socialLinks: ReadonlyArray<PublicFooterSocialLink>;
  copyright: string;
};

const PUBLIC_NAVIGATION_ITEMS: ReadonlyArray<PublicNavigationItem> = [
  {
    key: "home",
    href: "/#home",
    labelVI: "Trang chủ",
    labelJP: "ホーム",
    position: 1,
    visible: true,
  },
  {
    key: "about",
    href: "/#about",
    labelVI: "Về chúng tôi",
    labelJP: "会社情報",
    position: 2,
    visible: true,
  },
  {
    key: "achievements",
    href: "/#achievements",
    labelVI: "Lĩnh vực kinh doanh",
    labelJP: "事業領域",
    position: 3,
    visible: true,
  },
  {
    key: "news",
    href: "/#blog",
    labelVI: "Tin tức",
    labelJP: "ニュース",
    position: 4,
    visible: true,
  },
  {
    key: "jobs",
    href: "/#jobs",
    labelVI: "Tuyển dụng",
    labelJP: "採用情報",
    position: 5,
    visible: true,
  },
];

const FOOTER_NAV_KEYS: ReadonlyArray<PublicNavigationKey> = [
  "about",
  "achievements",
  "news",
  "jobs",
];

const HEADER_CONTENT_BY_LOCALE: Readonly<
  Record<PublicLocale, PublicHeaderContent>
> = {
  vi: {
    languageSwitcher: {
      label: "Tiếng Việt",
      switchTo: "日本語",
      ariaLabel: "Chuyển sang tiếng Nhật",
    },
  },
  ja: {
    languageSwitcher: {
      label: "日本語",
      switchTo: "Tiếng Việt",
      ariaLabel: "ベトナム語に切り替える",
    },
  },
};

const FOOTER_CONTENT_BY_LOCALE: Readonly<
  Record<PublicLocale, PublicFooterContent>
> = {
  vi: {
    aboutLabel: "Về chúng tôi",
    summary:
      "Kết nối ứng viên toàn cầu với doanh nghiệp uy tín tại Nhật Bản qua quy trình tuyển dụng minh bạch.",
    quickLinksLabel: "Liên kết nhanh",
    contactLabel: "Liên hệ",
    contactItems: [
      {
        label: "Email",
        value: "tlg@tlgcompany.jp",
        href: "mailto:tlg@tlgcompany.jp",
      },
      {
        label: "Hotline",
        value: "03-6784-4064",
        href: "tel:0367844064",
      },
      {
        label: "Địa chỉ",
        value: "3-23-23 Kitakoiwa, Quận Edogawa, Tokyo 113-0051, Nhật Bản",
        href: "",
      },
    ],
    socialLinksLabel: "Mạng xã hội",
    socialLinks: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "LinkedIn", href: "https://linkedin.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "X", href: "https://x.com" },
    ],
    copyright: "© 2026 TLG. All rights reserved.",
  },
  ja: {
    aboutLabel: "会社概要",
    summary:
      "グローバル人材と信頼できる日本企業を、明確な採用プロセスでつなぎます。",
    quickLinksLabel: "クイックリンク",
    contactLabel: "お問い合わせ",
    contactItems: [
      {
        label: "Email",
        value: "tlg@tlgcompany.jp",
        href: "mailto:tlg@tlgcompany.jp",
      },
      {
        label: "電話",
        value: "03-6784-4064",
        href: "tel:0367844064",
      },
      {
        label: "住所",
        value: "〒113-0051 東京都江戸川区北小岩3-23-23",
        href: "",
      },
    ],
    socialLinksLabel: "SNS",
    socialLinks: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "LinkedIn", href: "https://linkedin.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "X", href: "https://x.com" },
    ],
    copyright: "© 2026 TLG. All rights reserved.",
  },
};

function localizeNavigationLabel(
  item: PublicNavigationItem,
  locale: PublicLocale,
): string {
  return locale === "ja" ? item.labelJP : item.labelVI;
}

export function getPublicNavigationItems(
  locale: PublicLocale,
): LocalizedPublicNavigationItem[] {
  return PUBLIC_NAVIGATION_ITEMS.filter((item) => item.visible)
    .sort((left, right) => left.position - right.position)
    .map((item) => ({
      key: item.key,
      href: item.href,
      label: localizeNavigationLabel(item, locale),
      position: item.position,
    }));
}

export function getPublicFooterNavigation(
  locale: PublicLocale,
): LocalizedPublicNavigationItem[] {
  const items = getPublicNavigationItems(locale);
  return FOOTER_NAV_KEYS.map((key) =>
    items.find((item) => item.key === key),
  ).filter((item): item is LocalizedPublicNavigationItem => Boolean(item));
}

export function getPublicHeaderContent(
  locale: PublicLocale,
): PublicHeaderContent {
  return HEADER_CONTENT_BY_LOCALE[locale];
}

export function getPublicFooterContent(
  locale: PublicLocale,
): PublicFooterContent {
  return FOOTER_CONTENT_BY_LOCALE[locale];
}
