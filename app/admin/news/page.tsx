import Link from "next/link";

import { Button } from "@/components/ui/button";
import { findAdminNewsList } from "@/lib/db/repositories/news";

import NewsListClient from "./news-list-client";

export default async function AdminNewsListPage() {
  const items = await findAdminNewsList();

  // Serialize dates to ISO strings for client-side TanStack Query hydration
  const initialData = {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      status: item.status,
      publishAt: item.publishAt?.toISOString() ?? null,
      scheduledAt: item.scheduledAt?.toISOString() ?? null,
      updatedAt: item.updatedAt.toISOString(),
      category: item.category,
    })),
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            News
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage draft and published news articles.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/news/new">Create News Post</Link>
        </Button>
      </section>

      <NewsListClient initialData={initialData} />
    </div>
  );
}
