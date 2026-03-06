import type { Metadata } from "next";

import {
  getFallbackPublicLocale,
  localizePublicPath,
  PUBLIC_LOCALES,
  type PublicLocale,
} from "@/lib/i18n/public-locales";

export type LocalizedMetadataValue = Partial<Record<PublicLocale, string>>;

export type MetadataTextInput = string | LocalizedMetadataValue;

function normalizeMetadataText(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function resolveMetadataInputValue(
  input: MetadataTextInput,
  locale: PublicLocale,
  fallbackLocale: PublicLocale,
): string | null {
  if (typeof input === "string") {
    return normalizeMetadataText(input);
  }

  return (
    normalizeMetadataText(input[locale]) ??
    normalizeMetadataText(input[fallbackLocale]) ??
    normalizeMetadataText(input.vi) ??
    normalizeMetadataText(input.ja) ??
    null
  );
}

export type BuildCanonicalPathOptions = {
  locale: PublicLocale;
  pathname: string;
};

export function buildPublicCanonicalPath({ locale, pathname }: BuildCanonicalPathOptions): string {
  return localizePublicPath(pathname, locale);
}

export type ResolvePublicMetadataTextOptions = {
  locale: PublicLocale;
  value: MetadataTextInput;
  fallbackLocale?: PublicLocale;
  defaultValue?: string;
};

export function resolvePublicMetadataText({
  locale,
  value,
  fallbackLocale = getFallbackPublicLocale(locale),
  defaultValue = "",
}: ResolvePublicMetadataTextOptions): string {
  return resolveMetadataInputValue(value, locale, fallbackLocale) ?? defaultValue;
}

export type BuildPublicMetadataTitleOptions = {
  locale: PublicLocale;
  title: MetadataTextInput;
  siteName?: MetadataTextInput;
  fallbackLocale?: PublicLocale;
  separator?: string;
  defaultTitle?: string;
};

export function buildPublicMetadataTitle({
  locale,
  title,
  siteName,
  fallbackLocale = getFallbackPublicLocale(locale),
  separator = " | ",
  defaultTitle = "",
}: BuildPublicMetadataTitleOptions): string {
  const resolvedTitle = resolveMetadataInputValue(title, locale, fallbackLocale);
  const resolvedSiteName = siteName
    ? resolveMetadataInputValue(siteName, locale, fallbackLocale)
    : null;

  if (resolvedTitle && resolvedSiteName) {
    return `${resolvedTitle}${separator}${resolvedSiteName}`;
  }

  if (resolvedTitle) {
    return resolvedTitle;
  }

  if (resolvedSiteName) {
    return resolvedSiteName;
  }

  return defaultTitle;
}

export type BuildPublicMetadataDescriptionOptions = {
  locale: PublicLocale;
  description: MetadataTextInput;
  fallbackLocale?: PublicLocale;
  defaultDescription?: string;
};

export function buildPublicMetadataDescription({
  locale,
  description,
  fallbackLocale = getFallbackPublicLocale(locale),
  defaultDescription = "",
}: BuildPublicMetadataDescriptionOptions): string {
  return resolveMetadataInputValue(description, locale, fallbackLocale) ?? defaultDescription;
}

export type BuildPublicDetailMetadataAlternatesOptions = {
  locale: PublicLocale;
  pathname: string;
};

export function buildPublicDetailMetadataAlternates({
  locale,
  pathname,
}: BuildPublicDetailMetadataAlternatesOptions): Metadata["alternates"] {
  const canonical = buildPublicCanonicalPath({
    locale,
    pathname,
  });

  const languages = Object.fromEntries(
    PUBLIC_LOCALES.map((availableLocale) => [
      availableLocale,
      buildPublicCanonicalPath({
        locale: availableLocale,
        pathname,
      }),
    ]),
  ) as NonNullable<Metadata["alternates"]>["languages"];

  return {
    canonical,
    languages,
  };
}

export function buildPublicMetadataRobots(previewEnabled: boolean): Metadata["robots"] | undefined {
  if (!previewEnabled) {
    return undefined;
  }

  return {
    index: false,
    follow: false,
  };
}

export type BuildPublicDetailMetadataOptions = {
  locale: PublicLocale;
  pathname: string;
  title: MetadataTextInput;
  siteName?: MetadataTextInput;
  description: MetadataTextInput;
  fallbackLocale?: PublicLocale;
  defaultTitle?: string;
  defaultDescription?: string;
  previewEnabled?: boolean;
  openGraph?:
    | ({
        type?: "article" | "website";
        publishedTime?: string;
        modifiedTime?: string;
        images?: NonNullable<Metadata["openGraph"]>["images"];
      } & Omit<NonNullable<Metadata["openGraph"]>, "title" | "description" | "url" | "type" | "images">)
    | null;
};

export function buildPublicDetailMetadata({
  locale,
  pathname,
  title,
  siteName,
  description,
  fallbackLocale = getFallbackPublicLocale(locale),
  defaultTitle = "",
  defaultDescription = "",
  previewEnabled = false,
  openGraph = null,
}: BuildPublicDetailMetadataOptions): Metadata {
  const resolvedTitle = buildPublicMetadataTitle({
    locale,
    title,
    siteName,
    fallbackLocale,
    defaultTitle,
  });
  const resolvedDescription = buildPublicMetadataDescription({
    locale,
    description,
    fallbackLocale,
    defaultDescription,
  });
  const alternates = buildPublicDetailMetadataAlternates({
    locale,
    pathname,
  });
  const robots = buildPublicMetadataRobots(previewEnabled);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates,
    robots,
    openGraph: openGraph
      ? {
          ...openGraph,
          type: openGraph.type ?? "article",
          title: resolvedTitle,
          description: resolvedDescription,
          url: buildPublicCanonicalPath({
            locale,
            pathname,
          }),
        }
      : undefined,
  };
}

export type BuildPublicUnavailableMetadataOptions = {
  locale: PublicLocale;
  title: MetadataTextInput;
  description: MetadataTextInput;
  siteName?: MetadataTextInput;
  fallbackLocale?: PublicLocale;
  defaultTitle?: string;
  defaultDescription?: string;
};

export function buildPublicUnavailableMetadata({
  locale,
  title,
  description,
  siteName,
  fallbackLocale = getFallbackPublicLocale(locale),
  defaultTitle = "",
  defaultDescription = "",
}: BuildPublicUnavailableMetadataOptions): Metadata {
  return {
    title: buildPublicMetadataTitle({
      locale,
      title,
      siteName,
      fallbackLocale,
      defaultTitle,
    }),
    description: buildPublicMetadataDescription({
      locale,
      description,
      fallbackLocale,
      defaultDescription,
    }),
    robots: {
      index: false,
      follow: false,
    },
  };
}
