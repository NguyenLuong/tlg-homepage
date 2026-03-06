/**
 * Job detail page copy text
 */

import type { PublicLocale } from "@/lib/i18n/public-locales";

export type JobDetailCopy = {
  jobNotFound: string;
  jobNotFoundDescription: string;
  previewNotice: string;
  publishedAt: string;
  salary: string;
  benefits: string;
  notSpecified: string;
  description: string;
  emptyDescription: string;
  backToJobs: string;
  metadataDefaultDescription: string;
  metadataSiteName: string;
  currency: string;
};

export const JOB_DETAIL_COPY: Record<PublicLocale, JobDetailCopy> = {
  vi: {
    jobNotFound: "Không tìm thấy việc làm",
    jobNotFoundDescription:
      "Tin tuyển dụng bạn tìm không tồn tại hoặc chưa được công khai.",
    previewNotice: "Chế độ xem trước: tin này có thể chưa được công khai.",
    publishedAt: "Đăng lúc:",
    salary: "Mức lương",
    benefits: "Phúc lợi",
    currency: "Yên",
    notSpecified: "Chưa cập nhật",
    description: "Mô tả công việc",
    emptyDescription: "Chưa có mô tả công việc.",
    backToJobs: "Quay lại danh sách việc làm",
    metadataDefaultDescription: "Thông tin chi tiết cơ hội việc làm tại TLG.",
    metadataSiteName: "Tuyển dụng TLG",
  },
  ja: {
    jobNotFound: "求人が見つかりません",
    jobNotFoundDescription: "指定の求人は存在しないか、公開されていません。",
    previewNotice: "プレビュー表示：この求人は未公開の可能性があります。",
    publishedAt: "公開日：",
    salary: "給与",
    benefits: "待遇・福利厚生",
    currency: "円",
    notSpecified: "未設定",
    description: "仕事内容",
    emptyDescription: "仕事内容はまだ公開されていません。",
    backToJobs: "求人一覧に戻る",
    metadataDefaultDescription: "TLGの公開求人詳細ページです。",
    metadataSiteName: "TLG求人",
  },
};
