export const PUBLIC_LOCALES = ["vi", "ja"] as const;

export type PublicLocale = (typeof PUBLIC_LOCALES)[number];

export const DEFAULT_PUBLIC_LOCALE: PublicLocale = "vi";

export const PUBLIC_LOCALE_FALLBACKS: Readonly<
  Record<PublicLocale, PublicLocale>
> = {
  vi: "ja",
  ja: "vi",
};

const PUBLIC_LOCALE_FALLBACK_ORDER: Readonly<
  Record<PublicLocale, readonly PublicLocale[]>
> = {
  vi: ["vi", "ja"],
  ja: ["ja", "vi"],
};

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function splitPathAndQuery(input: string): {
  pathname: string;
  search: string;
  hash: string;
} {
  const hashIndex = input.indexOf("#");
  const queryIndex = input.indexOf("?");

  const pathEnd =
    hashIndex >= 0 && queryIndex >= 0
      ? Math.min(hashIndex, queryIndex)
      : hashIndex >= 0
        ? hashIndex
        : queryIndex >= 0
          ? queryIndex
          : input.length;

  const pathname = input.slice(0, pathEnd);

  let search = "";
  if (queryIndex >= 0 && (hashIndex < 0 || queryIndex < hashIndex)) {
    const searchEnd = hashIndex >= 0 ? hashIndex : input.length;
    search = input.slice(queryIndex, searchEnd);
  }

  const hash = hashIndex >= 0 ? input.slice(hashIndex) : "";

  return {
    pathname,
    search,
    hash,
  };
}

function resolvePublicLocale(value: unknown): PublicLocale | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return isPublicLocale(normalized) ? normalized : null;
}

export function isPublicLocale(value: unknown): value is PublicLocale {
  return (
    typeof value === "string" &&
    (PUBLIC_LOCALES as readonly string[]).includes(value)
  );
}

export function parsePublicLocale(
  value: unknown,
  fallback: PublicLocale = DEFAULT_PUBLIC_LOCALE,
): PublicLocale {
  return resolvePublicLocale(value) ?? fallback;
}

export function getFallbackPublicLocale(locale: PublicLocale): PublicLocale {
  return PUBLIC_LOCALE_FALLBACKS[locale];
}

export function getPublicLocaleFallbackOrder(
  locale: PublicLocale,
): readonly PublicLocale[] {
  return PUBLIC_LOCALE_FALLBACK_ORDER[locale];
}

/**
 * Gets the opposite locale of the given locale.
 * @param current - The current locale
 * @returns The opposite locale (vi ↔ ja)
 * @example
 * getOppositeLocale('vi') // => 'ja'
 * getOppositeLocale('ja') // => 'vi'
 */
export function getOppositeLocale(current: PublicLocale): PublicLocale {
  return PUBLIC_LOCALE_FALLBACKS[current];
}

export function detectPublicLocaleFromPath(
  pathname: string,
): PublicLocale | null {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/");
  const firstSegment = segments[1];

  return resolvePublicLocale(firstSegment);
}

/**
 * Resolves the locale from a URL path, with fallback to the default locale.
 * This is the recommended function for client-side locale detection.
 * @param pathname - The URL pathname to parse
 * @param fallback - The fallback locale (defaults to DEFAULT_PUBLIC_LOCALE: "vi")
 * @returns The detected locale or the fallback (never null)
 * @example
 * resolvePublicLocaleFromPath('/ja/jobs') // => 'ja'
 * resolvePublicLocaleFromPath('/about') // => 'vi'
 * resolvePublicLocaleFromPath('/') // => 'vi'
 */
export function resolvePublicLocaleFromPath(
  pathname: string,
  fallback: PublicLocale = DEFAULT_PUBLIC_LOCALE,
): PublicLocale {
  return detectPublicLocaleFromPath(pathname) ?? fallback;
}

export function stripPublicLocaleFromPath(pathname: string): string {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/");
  const localeSegment = resolvePublicLocale(segments[1]);

  if (!localeSegment) {
    return normalizedPathname;
  }

  const stripped = `/${segments.slice(2).join("/")}`.replace(/\/{2,}/g, "/");
  return stripped === "" ? "/" : stripped;
}

export function localizePublicPath(
  pathname: string,
  locale: PublicLocale,
): string {
  const normalizedWithoutLocale = stripPublicLocaleFromPath(pathname);
  return normalizedWithoutLocale === "/"
    ? `/${locale}`
    : `/${locale}${normalizedWithoutLocale}`;
}

export function switchPublicLocalePath(
  input: string,
  targetLocale: PublicLocale,
): string {
  try {
    const absoluteUrl = new URL(input);
    const localizedPathname = localizePublicPath(
      absoluteUrl.pathname,
      targetLocale,
    );
    return `${absoluteUrl.origin}${localizedPathname}${absoluteUrl.search}${absoluteUrl.hash}`;
  } catch {
    const { pathname, search, hash } = splitPathAndQuery(input);
    const localizedPathname = localizePublicPath(pathname, targetLocale);

    return `${localizedPathname}${search}${hash}`;
  }
}

export function buildPublicPathWithLocale(
  pathname: string,
  locale: PublicLocale,
  params?: URLSearchParams,
): string {
  const localizedPathname = localizePublicPath(pathname, locale);

  if (!params || params.size === 0) {
    return localizedPathname;
  }

  return `${localizedPathname}?${params.toString()}`;
}
