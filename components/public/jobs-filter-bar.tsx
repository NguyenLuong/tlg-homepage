"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PublicLocale } from "@/lib/i18n/public-locales";

type PrefectureOption = {
  id: string;
  code: string;
  nameVN: string;
  nameJP: string | null;
};

type FilterCopy = {
  prefectureAriaLabel: string;
  allPrefectures: string;
  pageSizeAriaLabel: string;
  pageSize6: string;
  pageSize10: string;
  pageSize20: string;
  pageSize50: string;
  applyCta: string;
  resetCta: string;
};

type JobsFilterBarProps = {
  basePath: string;
  locale: PublicLocale;
  prefectures: PrefectureOption[];
  defaults: {
    prefecture: string;
    pageSize: string;
  };
  copy: FilterCopy;
  showReset: boolean;
};

function getLocalizedPrefectureName(
  prefecture: PrefectureOption,
  locale: PublicLocale,
): string {
  if (locale === "ja") {
    return prefecture.nameJP ?? prefecture.nameVN;
  }

  return prefecture.nameVN || prefecture.nameJP || prefecture.code;
}

const NONE = "__none__";

export function JobsFilterBar({
  basePath,
  locale,
  prefectures,
  defaults,
  copy,
  showReset,
}: JobsFilterBarProps) {
  const router = useRouter();
  const [prefecture, setPrefecture] = useState(defaults.prefecture || NONE);
  const [pageSize, setPageSize] = useState(defaults.pageSize || "10");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set("pageSize", pageSize);
    if (prefecture !== NONE) params.set("prefecture", prefecture);
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4 flex-wrap">
      <Select value={prefecture} onValueChange={setPrefecture}>
        <SelectTrigger aria-label={copy.prefectureAriaLabel}>
          <SelectValue placeholder={copy.allPrefectures} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{copy.allPrefectures}</SelectItem>
          {prefectures.map((p) => (
            <SelectItem key={p.id} value={p.code}>
              {getLocalizedPrefectureName(p, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={pageSize} onValueChange={setPageSize}>
        <SelectTrigger aria-label={copy.pageSizeAriaLabel}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="6">{copy.pageSize6}</SelectItem>
          <SelectItem value="10">{copy.pageSize10}</SelectItem>
          <SelectItem value="20">{copy.pageSize20}</SelectItem>
          <SelectItem value="50">{copy.pageSize50}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Button type="submit" className="w-full md:w-auto">
          {copy.applyCta}
        </Button>
        {showReset ? (
          <Button
            asChild
            type="button"
            variant="outline"
            className="w-full md:w-auto"
          >
            <Link href={basePath}>{copy.resetCta}</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
