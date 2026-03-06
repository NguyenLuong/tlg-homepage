"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  localizePublicPath,
  resolvePublicLocaleFromPath,
  switchPublicLocalePath,
  type PublicLocale,
} from "@/lib/i18n/public-locales";
import type {
  LocalizedPublicNavigationItem,
  PublicFooterContent,
} from "@/lib/public-content/navigation-content";
import {
  getPublicFooterContent,
  getPublicFooterNavigation,
} from "@/lib/public-content/navigation-content";

type PublicFooterProps = {
  locale: PublicLocale;
  navigation: LocalizedPublicNavigationItem[];
  content: PublicFooterContent;
};

function resolveLocalizedHref(
  item: LocalizedPublicNavigationItem,
  locale: PublicLocale,
): string {
  return localizePublicPath(item.href, locale);
}

function resolveContactHref(href: string, locale: PublicLocale): string {
  if (href.startsWith("/") || href.startsWith("#")) {
    return switchPublicLocalePath(href, locale);
  }

  return href;
}

export function PublicFooter({
  locale,
  navigation,
  content,
}: PublicFooterProps) {
  const pathname = usePathname();

  const resolvedLocale = resolvePublicLocaleFromPath(pathname ?? "");

  const resolvedContent =
    resolvedLocale !== locale
      ? getPublicFooterContent(resolvedLocale)
      : content;
  const resolvedNavigation =
    resolvedLocale !== locale
      ? getPublicFooterNavigation(resolvedLocale)
      : navigation;

  return (
    <footer className="border-t border-sky-100 bg-sky-50/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.5fr_0.5fr_1.5fr]">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {resolvedContent.aboutLabel}
          </h2>
          <p className="mt-4 text-sm text-slate-600">
            {resolvedContent.summary}
          </p>
          <p className="mt-6 text-xs text-slate-500">
            {resolvedContent.copyright}
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            {resolvedContent.quickLinksLabel}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {resolvedNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={resolveLocalizedHref(item, resolvedLocale)}
                  className="transition-colors hover:text-cyan-600"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            {resolvedContent.contactLabel}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {resolvedContent.contactItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <a
                    href={resolveContactHref(item.href, resolvedLocale)}
                    className="transition-colors flex gap-1 hover:text-cyan-600"
                  >
                    <div className="font-semibold text-slate-900">
                      {item.label}:{" "}
                    </div>
                    <div>{item.value}</div>
                  </a>
                ) : (
                  <div className="transition-colors">
                    <span className="font-semibold text-slate-900">
                      {item.label}:{" "}
                    </span>
                    <span>{item.value}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
