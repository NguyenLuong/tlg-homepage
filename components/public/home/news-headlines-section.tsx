import Link from "next/link";

import { ArrowRight, Newspaper } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import type { PublicLocale } from "@/lib/i18n/public-locales";
import type { HomepageContent } from "@/lib/public-content/homepage-content";
import type { HomeNewsHeadlineItem } from "@/lib/public-content/news-headlines";

import { SectionHeading } from "./section-heading";

function formatNewsHeadlineDate(
  value: Date | null,
  locale: PublicLocale,
): string {
  if (!value) {
    return locale === "ja" ? "公開中" : "Đang công khai";
  }

  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "vi-VN", {
    dateStyle: "medium",
  }).format(value);
}

type NewsHeadlinesSectionProps = {
  blogSection: HomepageContent["blogSection"];
  headlines: HomeNewsHeadlineItem[];
  locale: PublicLocale;
  withLocale: (href: string) => string;
};

export function NewsHeadlinesSection({
  blogSection,
  headlines,
  locale,
  withLocale,
}: NewsHeadlinesSectionProps) {
  return (
    <section id="blog" className="py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="text-[0.85rem] mb-1 text-center font-medium uppercase tracking-[2px] text-cyan-600">
          news
        </div>

        <SectionHeading
          title={blogSection.title}
          text={blogSection.description}
        />

        <div className="mb-10 text-center">
          <Link
            href={withLocale("/news")}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            <Newspaper className="h-4 w-4" />
            {blogSection.ctaLabel}
          </Link>
        </div>

        {headlines.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="h-10 w-10" />}
            title={
              locale === "ja"
                ? "公開中のニュースはまだありません"
                : "Chưa có tin tức đã công khai"
            }
            description={
              locale === "ja"
                ? "近日中に新しいニュースをお届けします。"
                : "Vui lòng quay lại sau để xem tin tức mới nhất."
            }
          />
        ) : (
          <ul className="space-y-0 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {headlines.map((headline) => (
              <li
                key={headline.id}
                className="flex items-start gap-4 px-6 py-4 transition hover:bg-slate-50"
              >
                <time
                  dateTime={headline.publishAt?.toISOString()}
                  className="w-24 shrink-0 text-sm font-medium tabular-nums text-slate-500"
                >
                  {formatNewsHeadlineDate(headline.publishAt, locale)}
                </time>
                <Link
                  href={withLocale(`/news/${headline.slug}`)}
                  className="inline-flex items-center gap-2 text-base font-semibold text-slate-900 transition hover:text-cyan-600"
                >
                  {headline.title}
                  <ArrowRight className="h-4 w-4 text-cyan-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
