"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function isHomePath(pathname: string): boolean {
  const stripped = pathname.replace(/^\/(ja|vi)/, "") || "/";
  return stripped === "/" || stripped === "";
}

import {
  localizePublicPath,
  switchPublicLocalePath,
  getOppositeLocale,
  resolvePublicLocaleFromPath,
  type PublicLocale,
} from "@/lib/i18n/public-locales";
import { cn } from "@/lib/utils";
import type {
  LocalizedPublicNavigationItem,
  PublicHeaderContent,
} from "@/lib/public-content/navigation-content";
import {
  getPublicHeaderContent,
  getPublicNavigationItems,
} from "@/lib/public-content/navigation-content";
import Image from "next/image";

type PublicHeaderProps = {
  locale: PublicLocale;
  navigation: LocalizedPublicNavigationItem[];
  content: PublicHeaderContent;
};

function resolveLocalizedHref(
  item: LocalizedPublicNavigationItem,
  locale: PublicLocale,
): string {
  if (item.href.startsWith("#")) {
    return switchPublicLocalePath(`/${item.href}`, locale);
  }

  if (item.href.includes("?") || item.href.includes("#")) {
    return switchPublicLocalePath(item.href, locale);
  }

  return localizePublicPath(item.href, locale);
}

export function PublicHeader({
  locale,
  navigation,
  content,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const resolvedLocale = resolvePublicLocaleFromPath(pathname ?? "");
  const oppositeLocale = getOppositeLocale(resolvedLocale);
  const resolvedContent =
    resolvedLocale !== locale
      ? getPublicHeaderContent(resolvedLocale)
      : content;
  const resolvedNavigation =
    resolvedLocale !== locale
      ? getPublicNavigationItems(resolvedLocale)
      : navigation;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const isJapanese = resolvedLocale === "ja";
  const currentLabel = resolvedContent.languageSwitcher.label;
  const switchLabel = resolvedContent.languageSwitcher.switchTo;
  const [vietnameseLabel, japaneseLabel] =
    resolvedLocale === "vi"
      ? [currentLabel, switchLabel]
      : [switchLabel, currentLabel];

  const buildSwitchPath = () => {
    const search = searchParams?.toString();
    const basePath = search ? `${pathname}?${search}` : pathname;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    return switchPublicLocalePath(`${basePath}${hash}`, oppositeLocale);
  };

  const handleLocaleToggle = (closeMenu = false) => {
    if (closeMenu) {
      setMobileMenuOpen(false);
    }

    router.push(buildSwitchPath());
  };

  // Force scroll to absolute top on route change (skip when navigating to a hash).
  // Next.js App Router soft navigation may scroll to the top of the
  // changed layout segment (i.e. <main>) instead of the window, leaving
  // content hidden behind the sticky header.
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    itemHref: string,
  ) => {
    const hashIndex = itemHref.indexOf("#");
    if (hashIndex === -1) return;
    const sectionId = itemHref.slice(hashIndex + 1);
    if (isHomePath(pathname ?? "")) {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    // When not on home page, let the Link navigate to home with the hash anchor.
  };

  const handleMobileNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    itemHref: string,
  ) => {
    setMobileMenuOpen(false);
    handleNavClick(e, itemHref);
  };

  // Block body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      firstFocusableRef.current?.focus();

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleEscKey);
      return () => {
        window.removeEventListener("keydown", handleEscKey);
      };
    }
  }, [mobileMenuOpen]);

  // Focus trap: Keep focus within menu
  useEffect(() => {
    if (!mobileMenuOpen || !mobileMenuRef.current) return;

    const menu = mobileMenuRef.current;
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    menu.addEventListener("keydown", handleTabKey);
    return () => {
      menu.removeEventListener("keydown", handleTabKey);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-2">
        <Link href={localizePublicPath("/", resolvedLocale)}>
          <Image src="/logo.jpg" alt="logo" width={48} height={48} />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-700">
            {resolvedNavigation.map((item) => {
              const href = resolveLocalizedHref(item, resolvedLocale);
              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="transition-colors hover:text-cyan-600"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop CTA Button */}
          <Link
            href={localizePublicPath(
              resolvedContent.cta.href,
              resolvedLocale,
            )}
            className="hidden items-center rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 md:inline-flex"
          >
            {resolvedContent.cta.label}
          </Link>

          {/* Desktop Language Toggle */}
          <button
            type="button"
            onClick={() => handleLocaleToggle()}
            className="hidden cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 md:inline-flex"
            aria-label={resolvedContent.languageSwitcher.ariaLabel}
            role="switch"
            aria-checked={isJapanese}
          >
            <span
              className={cn(
                "rounded-full px-2 py-1 transition font-[Inter]",
                !isJapanese && "bg-cyan-600 text-white",
              )}
            >
              {vietnameseLabel}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-1 transition",
                isJapanese && "bg-cyan-600 text-white",
              )}
            >
              {japaneseLabel}
            </span>
          </button>

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Drawer — rendered via portal to escape header's backdrop-filter stacking context */}
      {mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <nav
              ref={mobileMenuRef}
              aria-label="Mobile navigation"
              className="absolute right-0 top-0 h-full w-64 animate-slide-in-right bg-white shadow-2xl"
            >
              <div className="flex h-full flex-col">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <span className="text-lg font-bold text-slate-900">Menu</span>
                  <button
                    ref={firstFocusableRef}
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Close menu"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Navigation Links */}
                <ul className="flex-1 space-y-1 px-4 py-4">
                  {resolvedNavigation.map((item) => {
                    const href = resolveLocalizedHref(item, resolvedLocale);
                    return (
                      <li key={item.href}>
                        <Link
                          href={href}
                          onClick={(e) => handleMobileNavClick(e, item.href)}
                          className="block rounded-lg px-4 py-3 text-base font-medium text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Drawer Footer */}
                <div className="space-y-3 border-t border-slate-100 px-4 py-4">
                  {/* Mobile CTA Button */}
                  <Link
                    href={localizePublicPath(
                      resolvedContent.cta.href,
                      resolvedLocale,
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
                  >
                    {resolvedContent.cta.label}
                  </Link>

                  {/* Mobile Language Toggle */}
                  <button
                    type="button"
                    onClick={() => handleLocaleToggle(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
                    aria-label={resolvedContent.languageSwitcher.ariaLabel}
                    role="switch"
                    aria-checked={isJapanese}
                  >
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 transition",
                        !isJapanese && "bg-cyan-600 text-white",
                      )}
                    >
                      {vietnameseLabel}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 transition",
                        isJapanese && "bg-cyan-600 text-white",
                      )}
                    >
                      {japaneseLabel}
                    </span>
                  </button>
                </div>
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </header>
  );
}
