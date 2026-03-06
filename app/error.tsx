"use client";

import { useEffect } from "react";
import Link from "next/link";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logError } from "@/lib/monitoring/error-logger";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error with context and stack trace
    logError(error, {
      context: "RootErrorBoundary",
      metadata: {
        digest: error.digest,
        errorMessage: error.message,
      },
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertTriangle
                  className="h-8 w-8 text-red-600"
                  aria-hidden="true"
                />
              </div>
            </div>

            <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">
              Something went wrong
            </h1>

            <p className="mb-8 text-base leading-7 text-slate-600">
              An unexpected error occurred. Our team has been notified and is
              working on a fix.
            </p>

            {process.env.NODE_ENV === "development" && error.message && (
              <div className="mb-6 rounded-lg bg-slate-100 p-4 text-left">
                <p className="text-xs font-mono text-slate-700 break-words">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={reset} variant="default" size="default">
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>

              <Button asChild variant="outline" size="default">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Go to Homepage
                </Link>
              </Button>
            </div>

            {error.digest && (
              <p className="mt-6 text-xs text-slate-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
