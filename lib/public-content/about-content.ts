/**
 * About page content and default data
 */

import type { PublicLocale } from "@/lib/i18n/public-locales";

export type AboutPageCopy = {
  whoWeAreTitle: string;
  missionTitle: string;
  visionTitle: string;
  coreValuesTitle: string;
  milestonesTitle: string;
  valueLabel: string;
  milestoneLabel: string;
};

export const ABOUT_PAGE_COPY: Record<PublicLocale, AboutPageCopy> = {
  vi: {
    whoWeAreTitle: "Chúng tôi là ai",
    missionTitle: "Sứ mệnh",
    visionTitle: "Tầm nhìn",
    coreValuesTitle: "Giá trị cốt lõi",
    milestonesTitle: "Những cột mốc",
    valueLabel: "Giá trị",
    milestoneLabel: "Cột mốc",
  },
  ja: {
    whoWeAreTitle: "私たちについて",
    missionTitle: "ミッション",
    visionTitle: "ビジョン",
    coreValuesTitle: "コアバリュー",
    milestonesTitle: "マイルストーン",
    valueLabel: "価値",
    milestoneLabel: "マイルストーン",
  },
};

export type AboutContent = {
  hero: {
    headline: string;
    subheading: string;
    bannerImageId: string;
  };
  introduction: {
    overview: string;
  };
  mission: {
    text: string;
  };
  vision: {
    text: string;
  };
  coreValues: Array<{
    title: string;
    description: string;
  }>;
  milestones: Array<{
    year: string;
    title: string;
    description: string;
  }>;
};

export const DEFAULT_TITLE: Record<PublicLocale, string> = {
  vi: "Về TLG",
  ja: "TLGについて",
};

export const DEFAULT_ABOUT_CONTENT: Record<PublicLocale, AboutContent> = {
  vi: {
    hero: {
      headline: "Về TLG",
      subheading:
        "Chúng tôi kết nối các ứng viên quốc tế với các nhà tuyển dụng đáng tin cậy tại Nhật Bản thông qua hướng dẫn thực tế và hỗ trợ minh bạch.",
      bannerImageId: "",
    },
    introduction: {
      overview:
        "TLG tập trung vào việc giúp các ứng viên khám phá các cơ hội ổn định tại Nhật Bản và giúp các nhà tuyển dụng tuyển dụng với sự tự tin.",
    },
    mission: {
      text: "Cung cấp hỗ trợ tuyển dụng đáng tin cậy giúp việc tuyển dụng toàn cầu dễ dàng hơn cho cả ứng viên và nhà tuyển dụng.",
    },
    vision: {
      text: "Trở thành cầu nối đáng tin cậy cho sự nghiệp lâu dài giữa nhân tài quốc tế và thị trường việc làm Nhật Bản.",
    },
    coreValues: [],
    milestones: [],
  },
  ja: {
    hero: {
      headline: "TLGについて",
      subheading:
        "私たちは、実践的なガイダンスと透明性の高いサポートを通じて、国際的な候補者を日本の信頼できる雇用主とつなぎます。",
      bannerImageId: "",
    },
    introduction: {
      overview:
        "TLGは、候補者が日本で安定した機会を発見するのを助け、雇用主が自信を持って採用できるようにすることに焦点を当てています。",
    },
    mission: {
      text: "候補者と雇用主の両方にとってグローバルな採用を容易にする信頼できる採用サポートを提供します。",
    },
    vision: {
      text: "国際的な人材と日本の求人市場の間の長期的なキャリアのための信頼できる架け橋となる。",
    },
    coreValues: [],
    milestones: [],
  },
};
