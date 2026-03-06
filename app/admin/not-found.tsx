import Link from "next/link";

import {
  Briefcase,
  FileQuestion,
  LayoutDashboard,
  Newspaper,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-start gap-6 rounded-xl border border-slate-200 bg-white px-6 py-8 md:px-10 md:py-10 shadow-sm">
          {/* Icon and Title */}
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-slate-100 p-4">
              <FileQuestion
                className="h-8 w-8 text-slate-600"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">
                Error 404
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Page Not Found
              </h1>
            </div>
          </div>

          {/* Description */}
          <p className="text-base leading-7 text-slate-700">
            The admin page you&apos;re looking for doesn&apos;t exist. It may
            have been moved or removed, or you may have typed the URL
            incorrectly.
          </p>

          {/* Quick Links */}
          <div className="w-full">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              Quick Navigation:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <LayoutDashboard
                  className="h-4 w-4 text-slate-500"
                  aria-hidden="true"
                />
                Dashboard
              </Link>
              <Link
                href="/admin/jobs"
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Briefcase
                  className="h-4 w-4 text-slate-500"
                  aria-hidden="true"
                />
                Jobs
              </Link>
              <Link
                href="/admin/news"
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Newspaper
                  className="h-4 w-4 text-slate-500"
                  aria-hidden="true"
                />
                News
              </Link>
              <Link
                href="/admin/partners"
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <Users className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Partners
              </Link>
            </div>
          </div>

          {/* Primary Action */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="default" size="default">
              <Link href="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                Go to Admin Dashboard
              </Link>
            </Button>

            <Button asChild variant="outline" size="default">
              <Link href="/">Go to Public Site</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
