import Link from "next/link";

import { ArrowRight } from "lucide-react";

import {
  localizePublicPath,
  type PublicLocale,
} from "@/lib/i18n/public-locales";
import type { HomeJobsPreviewItem } from "@/lib/public-content/jobs-preview";
import {
  JobsListingGrid,
  type JobsListingGridItem,
  type FillerSlot,
} from "@/components/public/jobs-listing-grid";

const HOME_JOBS_SLOT_COUNT = 3;

type HomeJobsSection = {
  title: string;
  description: string;
  salaryPrefix: string;
  benefitsFallback: string;
  emptyState: string;
  benefits: string;
  currency: string;
  emptyDescription: string;
  viewMore: string;
  jobDetail: string;
};

const HOME_JOBS_CONTENT: Record<PublicLocale, HomeJobsSection> = {
  vi: {
    title: "Cơ hội việc làm nổi bật",
    description: "Danh sách được cập nhật từ các tin tuyển dụng đã công khai.",
    salaryPrefix: "Mức lương",
    currency: "Yên",
    benefits: "Phúc lợi",
    benefitsFallback: "Phúc lợi cạnh tranh",
    emptyState: "Hiện tại chưa có tin tuyển dụng mới.",
    emptyDescription:
      "Vui lòng quay lại sau hoặc xem trang danh sách để cập nhật nhanh nhất.",
    viewMore: "Xem thêm",
    jobDetail: "Xem chi tiết",
  },
  ja: {
    title: "注目の求人",
    description: "公開中の求人情報から更新されたリストです。",
    salaryPrefix: "給与",
    currency: "円",
    benefits: "待遇・福利厚生",
    benefitsFallback: "競争力のある福利厚生",
    emptyState: "現在、新しい求人情報はありません。",
    emptyDescription:
      "後ほど再度ご確認いただくか、一覧ページで最新情報をご確認ください。",
    viewMore: "もっと見る",
    jobDetail: "詳細を見る",
  },
};

type HomeJobsSectionProps = {
  jobs: HomeJobsPreviewItem[];
  locale: PublicLocale;
};

export function HomeJobsSection({ jobs, locale }: HomeJobsSectionProps) {
  const jobsPreview = jobs.slice(0, HOME_JOBS_SLOT_COUNT);
  const hasJobs = jobsPreview.length > 0;
  const emptySlotCount = Math.max(0, HOME_JOBS_SLOT_COUNT - jobsPreview.length);
  const content = HOME_JOBS_CONTENT[locale];

  const mappedJobs: JobsListingGridItem[] = jobsPreview.map((job) => ({
    id: job.id,
    title: job.title,
    salaryText: job.salaryText,
    benefitsSummary: job.benefits[0]
      ? job.benefits.join(", ")
      : content.benefitsFallback,
    prefectureName: job.prefecture,
    detailHref: localizePublicPath(`/jobs/${job.slug}`, locale),
    heroImage: job.heroImage,
  }));

  const fillerSlots: FillerSlot[] = hasJobs
    ? Array.from({ length: emptySlotCount }).map(() => ({
        title:
          locale === "ja"
            ? "求人情報更新中"
            : "Tin tuyển dụng đang được cập nhật",
        description:
          locale === "ja"
            ? "近日中に新しい機会を追加予定です。"
            : "Danh sách sẽ bổ sung thêm cơ hội mới trong thời gian tới.",
      }))
    : [];

  return (
    <section id="jobs" className="bg-white py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="text-[0.85rem] mb-1 text-center font-medium uppercase tracking-[2px] text-cyan-600">
          jobs
        </div>

        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
            {content.description}
          </p>
        </div>

        <JobsListingGrid
          jobs={mappedJobs}
          copy={{
            salaryLabel: content.salaryPrefix,
            benefitsLabel: content.benefits,
            detailCta: content.jobDetail,
            emptyTitle: content.emptyState,
            emptyDescription: content.emptyDescription,
            backToHomepageCta: content.viewMore,
            currency: content.currency,
          }}
          homepageHref={localizePublicPath("/jobs", locale)}
          fillerSlots={fillerSlots.length > 0 ? fillerSlots : undefined}
        />

        <div className="mt-8 text-center">
          <Link
            href={localizePublicPath("/jobs", locale)}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            {content.viewMore}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
