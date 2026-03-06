"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { QueryProvider } from "@/lib/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <QueryProvider>
      <TooltipProvider delayDuration={0}>
        <Toaster position="top-right" richColors />
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
          {!isLoginPage && <AdminSidebar />}

          <div className="flex-1 h-screen overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-6 py-8">
              <main className="w-full">{children}</main>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </QueryProvider>
  );
}
