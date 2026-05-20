import { Card, CardContent } from "@/components/ui/card";
import { parsePublicLocale } from "@/lib/i18n/public-locales";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/public-content/contact-content";

import ContactForm from "./contact-form";

type ContactPageProps = {
  params: Promise<{
    locale?: string;
  }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const routeParams = await params;
  const locale = parsePublicLocale(routeParams.locale);
  const publishedContent = DEFAULT_CONTACT_CONTENT[locale];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 to-white px-6 py-10 md:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {publishedContent.hero.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          {publishedContent.hero.headline}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-600 md:text-lg">
          {publishedContent.hero.subheading}
        </p>
        <p className="mt-3 max-w-3xl text-sm text-slate-500">
          {publishedContent.hero.note}
        </p>
      </section>

      <Card>
        <CardContent className="pt-6">
          <ContactForm content={publishedContent.form} locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
