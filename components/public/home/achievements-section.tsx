import type { HomepageContent } from "@/lib/public-content/homepage-content";

type AchievementsSectionProps = {
  achievementsSection: HomepageContent["achievementsSection"];
};

function SectionTitle({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <div className="mx-auto mb-12 text-center">
      <div className="text-[0.85rem] font-medium uppercase tracking-[2px] text-cyan-600">
        {subtitle}
      </div>
      <h2 className="mt-1 text-3xl font-bold text-slate-900 md:text-4xl">
        {title}
      </h2>
      <div className="mx-auto mt-3 h-[3px] w-[60px] rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300" />
    </div>
  );
}

const SUPPORT_ICONS = [
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
  "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
  "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  "M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z",
  "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z",
  "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z",
];

export function AchievementsSection({
  achievementsSection,
}: AchievementsSectionProps) {
  const {
    heroCta,
    whyChooseUs,
    specifiedSkill,
    systemFeatures,
    supportServices,
    processFlow,
  } = achievementsSection;

  return (
    <div id="achievements">
      {/* Hero CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-300 via-cyan-200 to-cyan-100 px-6 py-20 text-center text-black/80">
        <div className="pointer-events-none absolute -right-[20%] -top-[60%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="mb-5 text-[1.05rem] tracking-[1px] opacity-90">
            {heroCta.leadQuestion}
          </p>
          <h2 className="mb-4 text-[2.2rem] font-extrabold leading-snug md:text-4xl">
            {heroCta.title}
            <span className="text-black">{heroCta.titleHighlight}</span>
            {heroCta.titleRemaining}
          </h2>
          <p className="mx-auto max-w-[560px] text-base font-light opacity-85">
            {heroCta.description}
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            subtitle={whyChooseUs.subtitle}
            title={whyChooseUs.title}
          />
          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            {whyChooseUs.features.map((feature, index) => (
              <article
                key={feature.title}
                className={`rounded-2xl border border-cyan-100 bg-cyan-50/60 p-8 transition hover:-translate-y-1 hover-shadow-card`}
              >
                <div className="mb-4 inline-flex h-[42px] w-[42px] items-center justify-center rounded-[10px] bg-gradient-to-br from-cyan-500 to-cyan-400 text-base font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="text-[1.1rem] font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Specified Skilled Worker */}
      <section className="bg-cyan-50 px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            subtitle={specifiedSkill.subtitle}
            title={specifiedSkill.title}
          />
          <div className="mb-9 rounded-2xl bg-white p-10 shadow-panel">
            <p className="mb-4 text-[0.95rem] leading-7 text-slate-700">
              {specifiedSkill.description}
            </p>
            <div className="mb-5 rounded-r-lg border-l-[3px] border-cyan-200 bg-cyan-50 px-4 py-3 text-[0.82rem] text-slate-500">
              {specifiedSkill.note}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {specifiedSkill.tags.map((tag) => (
                <div
                  key={tag.label}
                  className="min-w-[240px] flex-1 rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/60 p-4"
                >
                  <div className="mb-1 text-[0.85rem] font-bold text-slate-900">
                    {tag.label}
                  </div>
                  <div className="text-[0.85rem] text-slate-600">
                    {tag.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            subtitle={systemFeatures.subtitle}
            title={systemFeatures.title}
          />
          <div className="overflow-hidden rounded-2xl shadow-panel">
            <table className="w-full border-collapse bg-white text-left text-[0.92rem]">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-900 to-cyan-700 text-white">
                  <th className="px-6 py-4 text-[0.88rem] font-semibold tracking-[0.5px]">
                    {systemFeatures.columnHeaders[0]}
                  </th>
                  <th className="px-6 py-4 text-[0.88rem] font-semibold tracking-[0.5px]">
                    {systemFeatures.columnHeaders[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {systemFeatures.rows.map((row, index) => (
                  <tr
                    key={row.label}
                    className="transition hover:bg-cyan-50/60"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Support Services */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            subtitle={supportServices.subtitle}
            title={supportServices.title}
          />
          {(() => {
            return (
              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                {supportServices.items.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/60 px-[18px] py-5 transition hover:-translate-y-0.5 hover-shadow-item"
                  >
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-[18px] w-[18px] fill-white"
                        aria-hidden="true"
                      >
                        <path d={SUPPORT_ICONS[index % SUPPORT_ICONS.length]} />
                      </svg>
                    </div>
                    <div className="pt-1.5 text-[0.9rem] font-medium text-slate-700">
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Process Flow */}
      <section className="bg-cyan-50 px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            subtitle={processFlow.subtitle}
            title={processFlow.title}
          />
          {/* Outer wrapper holds the line behind the badge column */}
          <div className="relative mx-auto max-w-[780px]">
            {/* Vertical connector line — centered on the 42px badge column (21px from left) */}
            <div className="absolute bottom-4 left-[21px] top-4 w-[3px] rounded-full bg-gradient-to-b from-cyan-500 to-cyan-200" />
            {processFlow.steps.map((step, index) => (
              <div
                key={step.title}
                className={`relative flex items-start gap-5${
                  index < processFlow.steps.length - 1 ? " mb-10" : ""
                }`}
              >
                {/* Badge — fixed width so card always starts to its right */}
                <div className="relative z-10 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-900 to-cyan-500 text-[0.9rem] font-bold text-white shadow-badge">
                  {index + 1}
                </div>
                {/* Card */}
                <div className="flex-1 rounded-2xl border border-cyan-100 bg-white p-6 shadow-card">
                  <h4 className="mb-2 text-[1.05rem] font-bold text-slate-900">
                    {step.title}
                  </h4>
                  <p className="text-[0.9rem] leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
