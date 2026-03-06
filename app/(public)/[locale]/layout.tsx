import { Suspense, type ReactNode, type CSSProperties } from "react";
import localFont from "next/font/local";
import { notFound } from "next/navigation";

import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import {
  isPublicLocale,
  parsePublicLocale,
  PUBLIC_LOCALES,
} from "@/lib/i18n/public-locales";
import {
  getPublicFooterContent,
  getPublicFooterNavigation,
  getPublicHeaderContent,
  getPublicNavigationItems,
} from "@/lib/public-content/navigation-content";

const meiryo = localFont({
  src: [
    {
      path: "../../../lib/fonts/Meiryo-UI.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-meiryo",
  display: "swap",
});

type PublicLocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams(): Array<{ locale: string }> {
  return PUBLIC_LOCALES.map((locale) => ({ locale }));
}

export default async function PublicLocaleLayout({
  children,
  params,
}: PublicLocaleLayoutProps) {
  const { locale } = await params;

  if (!isPublicLocale(locale)) {
    notFound();
  }

  const activeLocale = parsePublicLocale(locale);
  const headerNavigation = getPublicNavigationItems(activeLocale);
  const headerContent = getPublicHeaderContent(activeLocale);
  const footerNavigation = getPublicFooterNavigation(activeLocale);
  const footerContent = getPublicFooterContent(activeLocale);

  const isJa = activeLocale === "ja";

  return (
    <div
      className={`landing-shell min-h-screen bg-white text-slate-900 ${
        isJa ? meiryo.variable : ""
      }`}
      style={
        isJa
          ? ({
              "--font-sans": "var(--font-meiryo)",
              fontFamily: "var(--font-meiryo)",
            } as CSSProperties)
          : undefined
      }
    >
      <Suspense fallback={null}>
        <PublicHeader
          locale={activeLocale}
          navigation={headerNavigation}
          content={headerContent}
        />
      </Suspense>

      <main>{children}</main>

      <PublicFooter
        locale={activeLocale}
        navigation={footerNavigation}
        content={footerContent}
      />
    </div>
  );
}
