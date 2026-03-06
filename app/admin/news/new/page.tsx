import Link from "next/link";

import { Button } from "@/components/ui/button";
import { findAdminNewsCategories } from "@/lib/db/repositories/lookups";

import NewsCreateForm from "./news-create-form";

export default async function AdminNewsCreatePage() {
  const categories = await findAdminNewsCategories();

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create News Post
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter details and create a draft news post.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/news">Back to News</Link>
        </Button>
      </section>

      <NewsCreateForm categories={categories} />
    </div>
  );
}
