/**
 * News detail page copy text
 */

import type { PublicLocale } from "@/lib/i18n/public-locales";

export type NewsDetailCopy = {
  newsNotFound: string;
  newsNotFoundDescription: string;
  previewNotice: string;
  noDetails: string;
  backToNews: string;
  justNow: string;
  metadataDefaultDescription: string;
  metadataSiteName: string;
};

export const NEWS_DETAIL_COPY: Record<PublicLocale, NewsDetailCopy> = {
  vi: {
    newsNotFound: "Không tìm thấy bài viết",
    newsNotFoundDescription:
      "Bài viết bạn tìm không tồn tại hoặc chưa được công khai.",
    previewNotice: "Chế độ xem trước: bài viết này có thể chưa được công khai.",
    noDetails: "Chưa có nội dung chi tiết bổ sung.",
    backToNews: "Quay lại trang tin tức",
    justNow: "Vừa đăng",
    metadataDefaultDescription: "Cập nhật mới nhất từ TLG.",
    metadataSiteName: "Tin tức TLG",
  },
  ja: {
    newsNotFound: "ニュースが見つかりません",
    newsNotFoundDescription:
      "指定のニュースは存在しないか、公開されていません。",
    previewNotice: "プレビュー表示：この記事は未公開の可能性があります。",
    noDetails: "追加の詳細はまだありません。",
    backToNews: "ニュース一覧に戻る",
    justNow: "たった今",
    metadataDefaultDescription: "TLGからの最新情報。",
    metadataSiteName: "TLGニュース",
  },
};
