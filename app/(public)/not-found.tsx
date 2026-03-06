import Link from "next/link";
import { headers } from "next/headers";

import { FileQuestion, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolvePublicLocaleFromPath } from "@/lib/i18n/public-locales";

const NOT_FOUND_CONTENT = {
  vi: {
    title: "Không tìm thấy trang",
    description:
      "Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Trang có thể đã bị xóa, di chuyển, hoặc không tồn tại.",
    suggestions: "Gợi ý:",
    suggestionsList: [
      "Kiểm tra lại địa chỉ URL",
      "Quay lại trang chủ",
      "Tìm kiếm công việc",
      "Xem tin tức mới nhất",
    ],
    goHome: "Về trang chủ",
    viewJobs: "Xem tuyển dụng",
    errorCode: "Lỗi 404",
  },
  ja: {
    title: "ページが見つかりません",
    description:
      "申し訳ございませんが、お探しのページが見つかりませんでした。ページが削除されたか、移動した可能性があります。",
    suggestions: "ご提案:",
    suggestionsList: [
      "URLアドレスを再確認してください",
      "ホームページに戻る",
      "求人を検索",
      "最新のニュースを見る",
    ],
    goHome: "ホームページ",
    viewJobs: "採用情報を見る",
    errorCode: "エラー 404",
  },
};

export default async function PublicNotFound() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const locale = resolvePublicLocaleFromPath(pathname);
  const content = NOT_FOUND_CONTENT[locale];

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <article
          className="flex flex-col items-start gap-6 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 md:px-10 md:py-12"
          role="alert"
          aria-live="polite"
        >
          {/* Icon and Title */}
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-sky-100 p-4">
              <FileQuestion
                className="h-8 w-8 text-sky-600"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-600 mb-1">
                {content.errorCode}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {content.title}
              </h1>
            </div>
          </div>

          {/* Description */}
          <p className="text-base leading-7 text-slate-700">
            {content.description}
          </p>

          {/* Suggestions */}
          <div className="w-full rounded-lg border border-slate-200 bg-white px-5 py-4">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              {content.suggestions}
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              {content.suggestionsList.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-sky-500 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="default" size="default">
              <Link href={`/${locale}`}>
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                {content.goHome}
              </Link>
            </Button>

            <Button asChild variant="outline" size="default">
              <Link href={`/${locale}/jobs`}>
                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                {content.viewJobs}
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
