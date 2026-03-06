/**
 * Jobs listing page copy text
 */

import type { PublicLocale } from "@/lib/i18n/public-locales";

export type JobsListContent = {
  pageTitle: string;
  pageDescription: string;
  filtersTitle: string;
  filtersDescription: string;
  prefectureAriaLabel: string;
  currency: string;
  allPrefectures: string;
  pageSizeAriaLabel: string;
  pageSize6: string;
  pageSize10: string;
  pageSize20: string;
  pageSize50: string;
  applyCta: string;
  resetCta: string;
  resultsHeading: string;
  buildResultsSummary: (start: number, end: number, total: number) => string;
  emptyTitle: string;
  emptyDescription: string;
  resetFiltersCta: string;
  backToHomepageCta: string;
  salaryLabel: string;
  benefitsLabel: string;
  benefitsFallback: string;
  detailCta: string;
  paginationAriaLabel: string;
  previousCta: string;
  nextCta: string;
  buildPaginationSummary: (page: number, pageCount: number) => string;
};

export const JOBS_LIST_CONTENT: Record<PublicLocale, JobsListContent> = {
  vi: {
    pageTitle: "Danh sách việc làm",
    pageDescription: "Xem các vị trí đang tuyển và lọc theo địa điểm.",
    filtersTitle: "Bộ lọc",
    filtersDescription: "Lọc việc theo tỉnh/thành và số lượng mỗi trang.",
    prefectureAriaLabel: "Lọc theo tỉnh/thành",
    allPrefectures: "Tất cả tỉnh/thành",
    pageSizeAriaLabel: "Số việc mỗi trang",
    pageSize6: "6 / trang",
    pageSize10: "10 / trang",
    pageSize20: "20 / trang",
    pageSize50: "50 / trang",
    applyCta: "Áp dụng",
    resetCta: "Đặt lại",
    resultsHeading: "Cơ hội đang tuyển",
    buildResultsSummary: (start, end, total) =>
      `Đang hiển thị ${start}-${end} trên tổng ${total} việc làm`,
    emptyTitle: "Không có việc làm công khai phù hợp bộ lọc hiện tại.",
    emptyDescription:
      "Hãy điều chỉnh bộ lọc, hoặc quay lại sau để xem các cơ hội mới.",
    resetFiltersCta: "Đặt lại bộ lọc",
    backToHomepageCta: "Quay lại trang chủ",
    salaryLabel: "Mức lương",
    currency: "Yên",
    benefitsLabel: "Phúc lợi",
    benefitsFallback: "Phúc lợi cạnh tranh",
    detailCta: "Xem chi tiết",
    paginationAriaLabel: "Phân trang việc làm",
    previousCta: "Trang trước",
    nextCta: "Trang sau",
    buildPaginationSummary: (page, pageCount) => `Trang ${page} / ${pageCount}`,
  },
  ja: {
    pageTitle: "求人一覧",
    pageDescription: "公開中の求人を確認し、地域で絞り込みできます。",
    filtersTitle: "絞り込み",
    filtersDescription: "都道府県と表示件数で絞り込みできます。",
    prefectureAriaLabel: "都道府県で絞り込み",
    allPrefectures: "すべての都道府県",
    pageSizeAriaLabel: "1ページの表示件数",
    pageSize6: "6件/ページ",
    pageSize10: "10件/ページ",
    pageSize20: "20件/ページ",
    pageSize50: "50件/ページ",
    applyCta: "反映",
    resetCta: "リセット",
    resultsHeading: "募集中の求人",
    buildResultsSummary: (start, end, total) =>
      `${total}件中${start}-${end}件を表示`,
    emptyTitle: "条件に合う公開中の求人がありません。",
    emptyDescription:
      "絞り込み条件を変更するか、新規求人の公開までお待ちください。",
    currency: "円",
    resetFiltersCta: "絞り込みをリセット",
    backToHomepageCta: "トップページに戻る",
    salaryLabel: "給与",
    benefitsLabel: "福利厚生",
    benefitsFallback: "競争力のある福利厚生",
    detailCta: "詳細を見る",
    paginationAriaLabel: "求人ページネーション",
    previousCta: "前のページ",
    nextCta: "次のページ",
    buildPaginationSummary: (page, pageCount) => `${page}/${pageCount}ページ`,
  },
};
