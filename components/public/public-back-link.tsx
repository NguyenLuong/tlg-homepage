import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicBackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function PublicBackLink({ href, label, className }: PublicBackLinkProps) {
  return (
    <Button asChild variant="outline" size="sm" className={cn(className)}>
      <Link href={href}>
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  );
}
