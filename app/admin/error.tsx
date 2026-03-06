"use client";

import { useEffect } from "react";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { logError } from "@/lib/monitoring/error-logger";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error with admin context
    logError(error, {
      context: "AdminErrorBoundary",
      metadata: {
        digest: error.digest,
        errorMessage: error.message,
      },
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-start gap-5 rounded-xl border border-red-200 bg-red-50 px-6 py-8 md:px-8 md:py-10">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Admin Error
            </h1>
          </div>

          <p className="text-base leading-7 text-slate-700">
            An unexpected error occurred in the admin panel. Please try again or
            return to the admin dashboard.
          </p>

          {error.message && (
            <div className="w-full rounded-lg bg-white border border-red-200 p-4">
              <p className="text-sm font-semibold text-slate-900 mb-2">
                Error Details:
              </p>
              <p className="text-xs font-mono text-slate-700 break-words">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={reset} variant="default" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try Again
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                Admin Dashboard
              </Link>
            </Button>

            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Go Back
            </Button>
          </div>

          {error.digest && (
            <div className="mt-2 text-xs text-slate-600">
              <span className="font-semibold">Error ID:</span> {error.digest}
            </div>
          )}

          <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold mb-1">💡 Tip</p>
            <p>
              If this error persists, please check the browser console for more
              details or contact technical support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
