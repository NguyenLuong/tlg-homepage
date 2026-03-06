"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/http/api-client";
import { useNewsDetail, type NewsDetailResponse } from "@/lib/queries/news";
import { queryKeys } from "@/lib/queries/keys";

type NewsStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

const NEWS_STATUS = {
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

type NewsEditorFormProps = {
  newsId: string;
  initialData: NewsDetailResponse;
};

type FormState = {
  title: string;
  categoryId: string;
  contentHtml: string;
};

type NewsMetadata = {
  status: NewsStatus;
  publishAt: string | null;
  scheduledAt?: string | null;
  updatedAt: string;
};

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

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/** Extract the HTML string stored inside contentRich */
function toContentHtml(contentRich: Record<string, unknown>): string {
  return typeof contentRich.html === "string" ? contentRich.html : "";
}

export default function NewsEditorForm({
  newsId,
  initialData,
}: NewsEditorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use query hook with initialData from SSR
  const { data } = useNewsDetail(newsId, initialData);

  // Data is always defined since we pass initialData
  const news = data!.news;
  const categories = data!.categories;

  const [form, setForm] = useState<FormState>({
    title: news.title,
    categoryId: news.categoryId,
    contentHtml: toContentHtml(news.contentRich),
  });

  const [currentStatus, setCurrentStatus] = useState<NewsStatus>(
    news.status as NewsStatus,
  );
  const [publishedAt, setPublishedAt] = useState<string | null>(news.publishAt);
  const [updatedAt, setUpdatedAt] = useState<string>(news.updatedAt);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlushingImages, setIsFlushingImages] = useState(false);

  const editorRef = useRef<RichTextEditorHandle>(null);

  const clearFeedback = () => {
    setFeedback(null);
    setError(null);
  };

  const showSuccess = (message: string) => {
    setError(null);
    setFeedback(message);
  };

  const showError = (message: string) => {
    setFeedback(null);
    setError(message);
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: (payload: {
      title: string;
      categoryId: string;
      contentRich: Record<string, unknown>;
    }) => api.patch<NewsMetadata>(`/api/admin/news/${newsId}`, payload),
    onMutate: () => {
      clearFeedback();
      showSuccess("Saving changes...");
    },
    onSuccess: (data) => {
      setCurrentStatus(data.status);
      setPublishedAt(data.publishAt);
      setUpdatedAt(data.updatedAt);
      showSuccess("News post saved.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.news.detail(newsId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : "Failed to save");
    },
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      api.post<NewsMetadata>(`/api/admin/news/${newsId}/publish`),
    onMutate: () => {
      clearFeedback();
      setCurrentStatus(NEWS_STATUS.PUBLISHED);
      setPublishedAt(new Date().toISOString());
      showSuccess("News post published.");
    },
    onSuccess: (data) => {
      setCurrentStatus(data.status);
      setPublishedAt(data.publishAt);
      setUpdatedAt(data.updatedAt);
      showSuccess("News post published.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.news.detail(newsId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
    },
    onError: (err) => {
      setCurrentStatus(news.status as NewsStatus);
      setPublishedAt(news.publishAt);
      showError(err instanceof Error ? err.message : "Failed to publish");
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () =>
      api.post<NewsMetadata>(`/api/admin/news/${newsId}/unpublish`),
    onMutate: () => {
      clearFeedback();
      setCurrentStatus(NEWS_STATUS.DRAFT);
      setPublishedAt(null);
      showSuccess("News post unpublished.");
    },
    onSuccess: (data) => {
      setCurrentStatus(data.status);
      setPublishedAt(data.publishAt);
      setUpdatedAt(data.updatedAt);
      showSuccess("News post unpublished.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.news.detail(newsId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
    },
    onError: (err) => {
      setCurrentStatus(news.status as NewsStatus);
      setPublishedAt(news.publishAt);
      showError(err instanceof Error ? err.message : "Failed to unpublish");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      api.delete<void>(`/api/admin/news/${newsId}?confirm=true`),
    onMutate: () => clearFeedback(),
    onSuccess: () => {
      showSuccess("News post deleted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.news.lists() });
      router.push("/admin/news");
      router.refresh();
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : "Failed to delete");
    },
  });

  const isMutating =
    isFlushingImages ||
    saveMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    deleteMutation.isPending;

  const canPublish = useMemo(
    () =>
      (currentStatus === NEWS_STATUS.DRAFT ||
        currentStatus === NEWS_STATUS.SCHEDULED) &&
      !isMutating,
    [currentStatus, isMutating],
  );

  const canUnpublish = useMemo(
    () => currentStatus === NEWS_STATUS.PUBLISHED && !isMutating,
    [currentStatus, isMutating],
  );

  const canDelete = useMemo(() => !isMutating, [isMutating]);

  const handleSave = async () => {
    let html = form.contentHtml;
    setIsFlushingImages(true);
    try {
      html = await (editorRef.current?.flush() ??
        Promise.resolve(form.contentHtml));
    } catch {
      // flush() already showed a toast; abort save
      return;
    } finally {
      setIsFlushingImages(false);
    }
    saveMutation.mutate({
      title: form.title,
      categoryId: form.categoryId,
      contentRich: { html },
    });
  };

  const handlePublish = () => {
    if (!canPublish) return;
    publishMutation.mutate(undefined);
  };

  const handleUnpublish = () => {
    if (!canUnpublish) return;
    unpublishMutation.mutate(undefined);
  };

  const handleDelete = () => {
    if (!canDelete) return;

    const confirmed = window.confirm(
      "Delete this news post permanently? This action cannot be undone.",
    );

    if (!confirmed) return;
    deleteMutation.mutate(undefined);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Post Status</CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              Updated: {formatDate(updatedAt)} | Published:{" "}
              {formatDate(publishedAt)}
            </p>
          </div>
          <Badge variant={STATUS_BADGE_VARIANT[currentStatus]}>
            {STATUS_LABEL[currentStatus]}
          </Badge>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit News Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">Title</div>
            <Input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="News title"
              disabled={isMutating}
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">Category</div>
            <Select
              value={form.categoryId}
              onValueChange={(v) => updateField("categoryId", v)}
              disabled={isMutating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.nameVN}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">News Content</div>
            <RichTextEditor
              ref={editorRef}
              aria-label="News Content"
              value={form.contentHtml}
              onChange={(html) => updateField("contentHtml", html)}
              placeholder="Write your news content here…"
              disabled={isMutating}
              withImageUpload
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {feedback ? (
            <p className="text-sm text-emerald-700">{feedback}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isMutating}
              loading={isFlushingImages || saveMutation.isPending}
              loadingText={
                isFlushingImages ? "Uploading images..." : "Saving..."
              }
            >
              Save Changes
            </Button>
            {currentStatus === NEWS_STATUS.PUBLISHED ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleUnpublish}
                disabled={!canUnpublish}
                loading={unpublishMutation.isPending}
                loadingText="Unpublishing..."
              >
                Unpublish
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handlePublish}
                disabled={!canPublish}
                loading={publishMutation.isPending}
                loadingText="Publishing..."
              >
                Publish
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete}
              loading={deleteMutation.isPending}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
