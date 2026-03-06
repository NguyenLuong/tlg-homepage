import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { findAdminNewsById } from "@/lib/db/repositories/news";
import { findAdminNewsCategories } from "@/lib/db/repositories/lookups";
import { findRecentMediaAssets } from "@/lib/db/repositories/media";

import NewsEditorForm from "./news-editor-form-dynamic";

type AdminNewsEditorPageProps = {
  params: Promise<{ id: string }>;
};

function toContentRichObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export default async function AdminNewsEditorPage({
  params,
}: AdminNewsEditorPageProps) {
  const { id } = await params;

  const [news, categories, mediaAssets] = await Promise.all([
    findAdminNewsById(id),
    findAdminNewsCategories(),
    findRecentMediaAssets(),
  ]);

  if (!news) {
    notFound();
  }

  // Pass as initialData for TanStack Query
  const initialData = {
    news: {
      id: news.id,
      title: news.title,
      slug: news.slug,
      contentRich: toContentRichObject(news.contentRich),
      categoryId: news.categoryId,
      status: news.status,
      updatedAt: news.updatedAt.toISOString(),
      publishAt: news.publishAt?.toISOString() ?? null,
    },
    categories,
    mediaAssets: mediaAssets.map((asset) => ({
      id: asset.id,
      url: asset.url,
      publicId: asset.publicId,
      altText: asset.altText,
      width: asset.width,
      height: asset.height,
      bytes: asset.bytes,
      mime: asset.mime,
      createdAt: asset.createdAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Edit News
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Update draft details and publish when ready.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/news">Back to News</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/news/new">Create News Post</Link>
          </Button>
        </div>
      </section>

      <NewsEditorForm newsId={id} initialData={initialData} />
    </div>
  );
}
