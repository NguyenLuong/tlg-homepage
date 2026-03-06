"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Newspaper,
  Briefcase,
  ClipboardList,
  ChevronsLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { LogoutButton } from "@/app/admin/logout-button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { href: "/admin/news", label: "News", icon: Newspaper },
    { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
    { href: "/admin/audit", label: "Audit Log", icon: ClipboardList },
  ];

  return (
    <aside
      className={cn(
        "group/sidebar sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out",
        collapsed ? "w-15" : "w-60",
      )}
    >
      {/* Header / Brand */}
      <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-3">
        <div className="flex w-full items-center gap-3 overflow-hidden">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronsLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300 ease-in-out",
                collapsed && "rotate-180",
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden whitespace-nowrap text-sm font-semibold tracking-wide text-slate-700 transition-all duration-300 ease-in-out",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            TLG Admin
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 py-3">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          const linkContent = (
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div
                className={cn(
                  "flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                )}
              >
                <div>{label}</div>
                {badge !== undefined && badge > 0 && (
                  <Badge
                    variant="default"
                    className="h-5 min-w-5 rounded-full px-1.5 text-xs"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
            </Link>
          );

          return collapsed ? (
            <Tooltip key={href}>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent side="right" className="text-sm">
                {label}
                {badge !== undefined && badge > 0 && ` (${badge})`}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div key={href}>{linkContent}</div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-200 px-2 py-3">
        <div
          className={cn(
            "mb-2 overflow-hidden whitespace-nowrap px-3 text-xs text-slate-400 transition-all duration-300 ease-in-out",
            collapsed ? "h-0 opacity-0" : "h-4 opacity-100",
          )}
        >
          Admin
        </div>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <LogoutButton collapsed={collapsed} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-sm">
              Logout
            </TooltipContent>
          </Tooltip>
        ) : (
          <LogoutButton collapsed={collapsed} />
        )}
      </div>
    </aside>
  );
}
