import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { parsePublicLocale } from "@/lib/i18n/public-locales";
import {
  ABOUT_PAGE_COPY,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_TITLE,
} from "@/lib/public-content/about-content";

type AboutPageProps = {
  params: Promise<{
    locale?: string;
  }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const routeParams = await params;
  const locale = parsePublicLocale(routeParams.locale);

  const publishedAboutContent = DEFAULT_ABOUT_CONTENT[locale];
  const title = DEFAULT_TITLE[locale];
  const copy = ABOUT_PAGE_COPY[locale];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 to-white px-6 py-10 md:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          {publishedAboutContent.hero.headline}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-600 md:text-lg">
          {publishedAboutContent.hero.subheading}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
          {copy.whoWeAreTitle}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-700 md:text-base">
          {publishedAboutContent.introduction.overview}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{copy.missionTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-slate-700 md:text-base">
            {publishedAboutContent.mission.text}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{copy.visionTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-slate-700 md:text-base">
            {publishedAboutContent.vision.text}
          </CardContent>
        </Card>
      </section>

      {publishedAboutContent.coreValues.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {copy.coreValuesTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {publishedAboutContent.coreValues.map((value, index) => (
              <Card key={`${value.title}-${index}`}>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg">
                    {value.title || `${copy.valueLabel} ${index + 1}`}
                  </CardTitle>
                </CardHeader>
                {value.description ? (
                  <CardContent className="text-sm leading-7 text-slate-700">
                    {value.description}
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {publishedAboutContent.milestones.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {copy.milestonesTitle}
          </h2>
          <div className="space-y-3">
            {publishedAboutContent.milestones.map((milestone, index) => (
              <Card key={`${milestone.year}-${milestone.title}-${index}`}>
                <CardHeader className="space-y-1">
                  {milestone.year ? (
                    <CardDescription>{milestone.year}</CardDescription>
                  ) : null}
                  <CardTitle className="text-lg">
                    {milestone.title || `${copy.milestoneLabel} ${index + 1}`}
                  </CardTitle>
                </CardHeader>
                {milestone.description ? (
                  <CardContent className="text-sm leading-7 text-slate-700">
                    {milestone.description}
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
