"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolvePublicLocaleFromPath } from "@/lib/i18n/public-locales";
import { logError } from "@/lib/monitoring/error-logger";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ERROR_CONTENT = {
  vi: {
    title: "Đã xảy ra lỗi",
    description:
      "Chúng tôi xin lỗi vì sự bất tiện này. Một lỗi không mong muốn đã xảy ra. Vui lòng thử lại hoặc quay lại trang chủ.",
    tryAgain: "Thử lại",
    goHome: "Về trang chủ",
    goBack: "Quay lại",
  },
  ja: {
    title: "エラーが発生しました",
    description:
      "ご不便をおかけして申し訳ございません。予期しないエラーが発生しました。もう一度お試しいただくか、ホームページにお戻りください。",
    tryAgain: "もう一度お試しください",
    goHome: "ホームページ",
    goBack: "戻る",
  },
};

export default function PublicError({ error, reset }: ErrorProps) {
  const pathname = usePathname();
  const locale = resolvePublicLocaleFromPath(pathname ?? "");
  const content = ERROR_CONTENT[locale];

  useEffect(() => {
    // Log error with context, locale, and path information
    logError(error, {
      context: "PublicErrorBoundary",
      metadata: {
        digest: error.digest,
        errorMessage: error.message,
        locale,
        pathname,
      },
    });
  }, [error, locale, pathname]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <article
          className="flex flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 md:px-8 md:py-10"
          aria-live="assertive"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              {content.title}
            </h1>
          </div>

          <p className="text-base leading-7 text-slate-700">
            {content.description}
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="w-full rounded-lg bg-slate-200 p-4">
              <p className="text-xs font-mono text-slate-700 wrap-break-word">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={reset} variant="default" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              {content.tryAgain}
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href={`/${locale}`}>
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                {content.goHome}
              </Link>
            </Button>

            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              {content.goBack}
            </Button>
          </div>

          {error.digest && (
            <p className="text-xs text-slate-500">Error ID: {error.digest}</p>
          )}
        </article>
      </div>
    </div>
  );
}
