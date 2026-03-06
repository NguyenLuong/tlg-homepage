import Link from "next/link";

import { ArrowRight } from "lucide-react";

export function CtaLink({
  href,
  label,
  tone = "primary",
}: {
  href: string;
  label: string;
  tone?: "primary" | "soft";
}) {
  const classes =
    tone === "primary"
      ? "bg-cyan-500 text-white hover:bg-cyan-600"
      : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${classes}`}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
