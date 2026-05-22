import Image from "next/image";

import { getBlurDataURL } from "@/lib/media/image-service";
import type { HomepageContent } from "@/lib/public-content/homepage-content";

import { CtaLink } from "./cta-link";

type HeroSectionProps = {
  hero: HomepageContent["hero"];
  withLocale: (href: string) => string;
};

export function HeroSection({ hero, withLocale }: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden h-[80vh] bg-linear-to-b from-cyan-50 via-white to-white lg:from-cyan-100/80 lg:via-sky-50/60"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={hero.bannerImage?.url ?? "/hero-banner.webp"}
          alt={hero.bannerImage?.altText || hero.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
          {...(hero.bannerImage
            ? {
                placeholder: "blur" as const,
                blurDataURL: getBlurDataURL(hero.bannerImage.url),
              }
            : {})}
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-linear-to-r from-cyan-50/40 via-cyan-50/40 to-cyan-50/40" />
      </div>

      <div className="relative z-10 mx-auto grid w-full h-[80vh] max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-32">
        <div>
          <p className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700 ring-1 ring-cyan-200">
            {hero.badge}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl whitespace-pre-line text-base leading-7 text-slate-700 md:text-lg">
            {hero.description}
          </p>
        </div>
      </div>
    </section>
  );
}
