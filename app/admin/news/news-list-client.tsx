"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useDeleteNews,
  useNewsList,
  usePrefetchNewsDetail,
  usePublishNews,
  useUnpublishNews,
  type NewsListItem,
  type NewsListResponse,
} from "@/lib/queries/news";

const DeleteNewsButton = dynamic(() => import("./delete-news-button"), {
  ssr: false,
  loading: () => (
    <Button size="sm" variant="destructive" disabled>
      Delete
    </Button>
  ),
});

// ── Constants ──────────────────────────────────────────────

type NewsStatus = NewsListItem["status"];

const STATUS_LABEL: Record<NewsStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const STATUS_BADGE_VARIANT: Record<
  NewsStatus,
  "secondary" | "default" | "outline" | "destructive"
> = {
  DRAFT: "secondary",
  SCHEDULED: "outline",
  PUBLISHED: "default",
  ARCHIVED: "destructive",
};

// ── Helpers ────────────────────────────────────────────────

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// ── Component ──────────────────────────────────────────────

type Props = {
  initialData: NewsListResponse;
};

export default function NewsListClient({ initialData }: Props) {
  const { data } = useNewsList(initialData);
  const prefetchDetail = usePrefetchNewsDetail();
  const deleteNews = useDeleteNews();
  const publishNews = usePublishNews();
  const unpublishNews = useUnpublishNews();

  const isMutating =
    deleteNews.isPending || publishNews.isPending || unpublishNews.isPending;

  const items = data?.items ?? initialData.items;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All posts</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState
              icon="📰"
              title="No news posts yet"
              description="Get started by creating your first news article."
              action={{
                label: "Create First Post",
                href: "/admin/news/new",
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-200 w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Updated</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="text-slate-700">
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          /{item.slug}
                        </div>
                      </td>
                      <td className="px-3 py-3">{item.category.nameVN}</td>
                      <td className="px-3 py-3">
                        <Badge variant={STATUS_BADGE_VARIANT[item.status]}>
                          {STATUS_LABEL[item.status]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        {formatDate(item.updatedAt)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild size="sm">
                            <Link
                              href={`/admin/news/${item.id}`}
                              onMouseEnter={() => prefetchDetail(item.id)}
                            >
                              Edit
                            </Link>
                          </Button>

                          {(item.status === "DRAFT" ||
                            item.status === "SCHEDULED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isMutating}
                              onClick={() =>
                                publishNews.mutate(item.id, {
                                  onError: (err) =>
                                    toast.error(
                                      err instanceof Error
                                        ? err.message
                                        : "Failed to publish news post",
                                    ),
                                })
                              }
                            >
                              Publish
                            </Button>
                          )}

                          {item.status === "PUBLISHED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isMutating}
                              onClick={() =>
                                unpublishNews.mutate(item.id, {
                                  onError: (err) =>
                                    toast.error(
                                      err instanceof Error
                                        ? err.message
                                        : "Failed to unpublish news post",
                                    ),
                                })
                              }
                            >
                              Unpublish
                            </Button>
                          )}

                          <DeleteNewsButton
                            newsId={item.id}
                            newsTitle={item.title}
                            disabled={isMutating}
                            onDelete={(id) =>
                              deleteNews.mutate(id, {
                                onError: (err) =>
                                  toast.error(
                                    err instanceof Error
                                      ? err.message
                                      : "Failed to delete news post",
                                  ),
                              })
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
