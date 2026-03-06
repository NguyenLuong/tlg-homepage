import {
  localizePublicPath,
  parsePublicLocale,
} from "@/lib/i18n/public-locales";
import { getHomeJobsPreview } from "@/lib/public-content/jobs-preview";
import { getHomeNewsHeadlines } from "@/lib/public-content/news-headlines";
import { getHomepageContent } from "@/lib/public-content/homepage-content";
import {
  HeroSection,
  AboutSection,
  HomeJobsSection,
  AchievementsSection,
  NewsHeadlinesSection,
} from "@/components/public/home";

type PublicHomePageProps = {
  params?: Promise<{
    locale?: string;
  }>;
};

export default async function Page({ params }: PublicHomePageProps = {}) {
  const routeParams = params ? await params : undefined;
  const locale = parsePublicLocale(routeParams?.locale);
  const withLocale = (href: string) => localizePublicPath(href, locale);

  const content = await getHomepageContent(locale);
  const jobsPreview = (await getHomeJobsPreview()).slice(0, 3);
  const newsHeadlines = await getHomeNewsHeadlines();

  return (
    <div className="landing-page relative isolate overflow-x-hidden bg-linear-to-b from-cyan-50 via-white to-sky-50/40">
      <div className="pointer-events-none absolute -left-28 top-[38%] -z-10 h-80 w-80 rounded-full bg-sky-100/55 blur-3xl sm:h-96 sm:w-96 lg:h-120 lg:w-120" />
      <div className="pointer-events-none absolute right-0 top-[72%] -z-10 h-64 w-64 rounded-full bg-cyan-100/45 blur-3xl sm:h-88 sm:w-88 lg:h-112 lg:w-md" />

      <HeroSection hero={content.hero} withLocale={withLocale} />

      <AboutSection locale={locale} />

      <AchievementsSection achievementsSection={content.achievementsSection} />

      <NewsHeadlinesSection
        blogSection={content.blogSection}
        headlines={newsHeadlines}
        locale={locale}
        withLocale={withLocale}
      />

      <HomeJobsSection jobs={jobsPreview} locale={locale} />
    </div>
  );
}
