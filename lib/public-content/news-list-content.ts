/**
 * News listing page copy text
 */

import type { PublicLocale } from "@/lib/i18n/public-locales";

export type NewsPageCopy = {
  title: string;
  subtitle: string;
  filtersTitle: string;
  filtersDescription: string;
  searchPlaceholder: string;
  categoryAriaLabel: string;
  allCategories: string;
  applyLabel: string;
  resetLabel: string;
  noResults: string;
  readMoreLabel: string;
  showingLabel: (start: number, end: number, total: number) => string;
  paginationLabel: string;
  pageLabel: (page: number, pageCount: number) => string;
  previousLabel: string;
  nextLabel: string;
  justNowLabel: string;
  searchAriaLabel: string;
  pageSizeAriaLabel: string;
  perPageLabels: Record<number, string>;
};

export const NEWS_PAGE_COPY: Record<PublicLocale, NewsPageCopy> = {
  vi: {
    title: "Tin tức",
    subtitle: "Cập nhật công ty, thông báo tuyển dụng và thông tin quan trọng.",
    filtersTitle: "Bộ lọc",
    filtersDescription:
      "Lọc tin theo danh mục, từ khóa và số lượng bản ghi mỗi trang.",
    searchPlaceholder: "Tìm theo tiêu đề hoặc tóm tắt",
    categoryAriaLabel: "Lọc theo danh mục",
    allCategories: "Tất cả danh mục",
    applyLabel: "Áp dụng",
    resetLabel: "Đặt lại",
    noResults: "Không có tin tức công khai phù hợp với bộ lọc hiện tại.",
    readMoreLabel: "Xem chi tiết",
    showingLabel: (start, end, total) =>
      `Đang hiển thị ${start}-${end} / ${total} bài viết`,
    paginationLabel: "Phân trang tin tức",
    pageLabel: (page, pageCount) => `Trang ${page} / ${pageCount}`,
    previousLabel: "Trang trước",
    nextLabel: "Trang sau",
    justNowLabel: "Vừa đăng",
    searchAriaLabel: "Tìm tin tức",
    pageSizeAriaLabel: "Số bài viết mỗi trang",
    perPageLabels: {
      6: "6 mỗi trang",
      10: "10 mỗi trang",
      20: "20 mỗi trang",
      50: "50 mỗi trang",
    },
  },
  ja: {
    title: "ニュース",
    subtitle: "会社の更新、採用のお知らせ、重要な情報。",
    filtersTitle: "絞り込み",
    filtersDescription:
      "カテゴリ、キーワード、ページサイズでニュースを絞り込みます。",
    searchPlaceholder: "タイトルまたは概要で検索",
    categoryAriaLabel: "カテゴリで絞り込み",
    allCategories: "すべてのカテゴリ",
    applyLabel: "適用",
    resetLabel: "リセット",
    noResults: "フィルターに一致する公開中のニュースがありません。",
    readMoreLabel: "詳細を読む",
    showingLabel: (start, end, total) =>
      `${start}-${end} / ${total}件の記事を表示`,
    paginationLabel: "ニュースページネーション",
    pageLabel: (page, pageCount) => `${page} / ${pageCount}ページ`,
    previousLabel: "前へ",
    nextLabel: "次へ",
    justNowLabel: "たった今",
    searchAriaLabel: "ニュースを検索",
    pageSizeAriaLabel: "ページあたりのニュース数",
    perPageLabels: {
      6: "ページあたり6件",
      10: "ページあたり10件",
      20: "ページあたり20件",
      50: "ページあたり50件",
    },
  },
};
