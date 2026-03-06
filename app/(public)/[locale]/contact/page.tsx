import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parsePublicLocale } from "@/lib/i18n/public-locales";
import {
  CONTACT_PAGE_COPY,
  DEFAULT_CONTACT_CONTENT,
  DEFAULT_PAGE_TITLE,
} from "@/lib/public-content/contact-content";

import ContactForm from "./contact-form";

type ContactPageProps = {
  params: Promise<{
    locale?: string;
  }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const routeParams = await params;
  const locale = parsePublicLocale(routeParams.locale);
  const pageCopy = CONTACT_PAGE_COPY[locale];

  const publishedContent = DEFAULT_CONTACT_CONTENT[locale];
  const title = DEFAULT_PAGE_TITLE[locale];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-10">
      <section className="rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 to-white px-6 py-10 md:px-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          {publishedContent.hero.headline}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-600 md:text-lg">
          {publishedContent.hero.subheading}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>{pageCopy.officeInfoTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-medium text-slate-900">
                {pageCopy.phoneLabel}
              </p>
              <p>{publishedContent.office.phone}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {pageCopy.emailLabel}
              </p>
              <p>{publishedContent.office.email}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {pageCopy.addressLabel}
              </p>
              <p>{publishedContent.office.address}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {pageCopy.workingHoursLabel}
              </p>
              <p>{publishedContent.office.workingHours}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <ContactForm content={publishedContent.form} locale={locale} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
