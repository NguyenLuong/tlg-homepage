"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PublicLocale } from "@/lib/i18n/public-locales";

type CategoryOption = {
  id: string;
  slug: string;
  nameVN: string;
  nameJA: string | null;
};

type FilterCopy = {
  searchPlaceholder: string;
  searchAriaLabel: string;
  categoryAriaLabel: string;
  allCategories: string;
  pageSizeAriaLabel: string;
  perPageLabels: Record<number, string>;
  applyLabel: string;
  resetLabel: string;
};

type NewsFilterBarProps = {
  basePath: string;
  locale: PublicLocale;
  categories: CategoryOption[];
  defaults: {
    q: string;
    category: string;
    pageSize: string;
  };
  copy: FilterCopy;
  showReset: boolean;
};

const NONE = "__none__";

export function NewsFilterBar({
  basePath,
  locale,
  categories,
  defaults,
  copy,
  showReset,
}: NewsFilterBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaults.q);
  const [category, setCategory] = useState(defaults.category || NONE);
  const [pageSize, setPageSize] = useState(defaults.pageSize || "10");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set("pageSize", pageSize);
    if (category !== NONE) params.set("category", category);
    if (q.trim()) params.set("q", q.trim());
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4 flex-wrap">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={copy.searchPlaceholder}
        aria-label={copy.searchAriaLabel}
        className="md:max-w-96 w-full"
      />

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger aria-label={copy.categoryAriaLabel}>
          <SelectValue placeholder={copy.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{copy.allCategories}</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>
              {locale === "ja" ? (c.nameJA ?? c.nameVN) : c.nameVN}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={pageSize} onValueChange={setPageSize}>
        <SelectTrigger aria-label={copy.pageSizeAriaLabel}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="6">{copy.perPageLabels[6]}</SelectItem>
          <SelectItem value="10">{copy.perPageLabels[10]}</SelectItem>
          <SelectItem value="20">{copy.perPageLabels[20]}</SelectItem>
          <SelectItem value="50">{copy.perPageLabels[50]}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 lg:col-span-2">
        <Button type="submit" className="w-full md:w-auto">
          {copy.applyLabel}
        </Button>
        {showReset ? (
          <Button
            asChild
            type="button"
            variant="outline"
            className="w-full md:w-auto"
          >
            <Link href={basePath}>{copy.resetLabel}</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
