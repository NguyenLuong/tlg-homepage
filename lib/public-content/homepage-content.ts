import type { PublicLocale } from "@/lib/i18n/public-locales";
import { DEFAULT_HOMEPAGE_CONTENT } from "./homepage-default-content";

export type HomepageFeature = {
  title: string;
  description: string;
};

export type SkillTag = {
  label: string;
  text: string;
};

export type FeatureRow = {
  label: string;
  value: string;
};

export type FlowStep = {
  title: string;
  description: string;
};

export type HomepageSpotlight = {
  title: string;
  summary: string;
  href: string;
  linkLabel: string;
};

export type HeroBannerImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type HomepageContent = {
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    bannerImage: HeroBannerImage | null;
  };
  achievementsSection: {
    heroCta: {
      leadQuestion: string;
      title: string;
      titleHighlight: string;
      titleRemaining: string;
      description: string;
    };
    whyChooseUs: {
      subtitle: string;
      title: string;
      features: HomepageFeature[];
    };
    specifiedSkill: {
      subtitle: string;
      title: string;
      description: string;
      note: string;
      tags: SkillTag[];
    };
    systemFeatures: {
      subtitle: string;
      title: string;
      columnHeaders: [string, string];
      rows: FeatureRow[];
    };
    supportServices: {
      subtitle: string;
      title: string;
      items: string[];
    };
    processFlow: {
      subtitle: string;
      title: string;
      steps: FlowStep[];
    };
  };
  blogSection: {
    title: string;
    description: string;
    ctaLabel: string;
  };
  spotlights: HomepageSpotlight[];
};

export async function getHomepageContent(
  locale: PublicLocale,
): Promise<HomepageContent> {
  const defaultContent = DEFAULT_HOMEPAGE_CONTENT[locale];

  return {
    hero: {
      badge: defaultContent.hero.badge,
      title: defaultContent.hero.title,
      description: defaultContent.hero.description,
      primaryCtaLabel: defaultContent.hero.primaryCtaLabel,
      bannerImage: null,
    },
    achievementsSection: defaultContent.achievementsSection,
    blogSection: defaultContent.blogSection,
    spotlights: defaultContent.spotlights,
  };
}
