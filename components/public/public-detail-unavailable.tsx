import Link from "next/link";

import { AlertCircle, ArrowLeft, Home, Lock, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorType = "404" | "403" | "500" | "generic";

type PublicDetailUnavailableProps = {
  type?: ErrorType;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  className?: string;
};

/**
 * Get icon color classes based on error type
 */
function getIconColorClass(type: ErrorType) {
  switch (type) {
    case "404":
      return "text-slate-400";
    case "403":
      return "text-amber-500";
    case "500":
      return "text-red-500";
    default:
      return "text-slate-400";
  }
}

/**
 * Display unavailable content with error type support and action buttons
 */
export function PublicDetailUnavailable({
  type = "generic",
  title,
  description,
  backHref,
  backLabel,
  homeHref = "/",
  homeLabel,
  className,
}: PublicDetailUnavailableProps) {
  const iconColorClass = getIconColorClass(type);

  return (
    <article
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col items-start gap-5 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8 md:px-8 md:py-10",
        className,
      )}
      aria-live="polite"
    >
      {/* Error Icon */}
      <div
        className={cn("rounded-full bg-white p-3 shadow-sm", iconColorClass)}
      >
        {type === "404" && (
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        )}
        {type === "403" && <Lock className="h-6 w-6" aria-hidden="true" />}
        {type === "500" && (
          <ServerCrash className="h-6 w-6" aria-hidden="true" />
        )}
        {type === "generic" && (
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        )}
      </div>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>
        <p className="text-base leading-7 text-slate-700">{description}</p>
      </header>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {backHref && backLabel && (
          <Button asChild variant="outline" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              {backLabel}
            </Link>
          </Button>
        )}

        {homeLabel && (
          <Button asChild variant="default" size="sm">
            <Link href={homeHref}>
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              {homeLabel}
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
