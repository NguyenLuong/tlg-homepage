"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  getInputErrorClasses,
  scrollToFirstError,
} from "@/lib/validation/form-errors";
import { validateNewsCreateForm } from "@/lib/validation/news-form-schema";

type CategoryOption = {
  id: string;
  nameVN: string;
};

type FormState = {
  title: string;
  categoryId: string;
  contentHtml: string;
};

type NewsCreateFormProps = {
  categories: CategoryOption[];
};

export default function NewsCreateForm({ categories }: NewsCreateFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: "",
    categoryId: categories[0]?.id ?? "",
    contentHtml: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const editorRef = useRef<RichTextEditorHandle>(null);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (publish = false) => {
    setFeedback(null);
    setError(null);
    setFieldErrors({});

    const result = validateNewsCreateForm({
      title: form.title,
      categoryId: form.categoryId,
      contentHtml: form.contentHtml,
    });

    if (!result.success) {
      setFieldErrors(result.errors);
      scrollToFirstError(result.errors, "news-create-form");
      return;
    }

    if (publish) {
      setIsPublishing(true);
    } else {
      setIsSaving(true);
    }
    setFeedback("Creating news post...");

    // Flush pending image uploads before sending to API
    let flushedHtml = result.data.contentRich.html as string;
    try {
      flushedHtml = await (editorRef.current?.flush() ??
        Promise.resolve(flushedHtml));
    } catch {
      // flush() already showed a toast; abort save
      setIsSaving(false);
      setIsPublishing(false);
      setFeedback(null);
      return;
    }

    try {
      const created = await api.post<{ id: string }>("/api/admin/news", {
        title: result.data.title,
        categoryId: result.data.categoryId,
        contentRich: { html: flushedHtml },
      });

      if (publish) {
        setFeedback("Publishing...");
        await api.post(`/api/admin/news/${created.id}/publish`);
      }

      setFeedback("News post created! Redirecting...");
      router.push(`/admin/news/${created.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create news post.",
      );
      setFeedback(null);
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  return (
    <Card>
      <CardContent id="news-create-form" className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="font-medium text-slate-700">Title</div>
          <Input
            name="title"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="News title"
            className={getInputErrorClasses("title", fieldErrors)}
          />
          {fieldErrors.title && (
            <p className="text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="font-medium text-slate-700">Category</div>
          <Select
            value={form.categoryId}
            onValueChange={(v) => updateField("categoryId", v)}
          >
            <SelectTrigger
              className={`w-full ${getInputErrorClasses("categoryId", fieldErrors)}`.trim()}
            >
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
          {fieldErrors.categoryId && (
            <p className="text-xs text-red-600">{fieldErrors.categoryId}</p>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="font-medium text-slate-700">News Content</div>
          <RichTextEditor
            ref={editorRef}
            aria-label="News Content"
            value={form.contentHtml}
            onChange={(html) => updateField("contentHtml", html)}
            placeholder="Write your news content here…"
            disabled={isSaving}
            withImageUpload
          />
          {fieldErrors.contentHtml && (
            <p className="text-xs text-red-600">{fieldErrors.contentHtml}</p>
          )}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {feedback ? (
          <p className="text-sm text-emerald-700">{feedback}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => handleCreate(true)}
            disabled={isSaving || isPublishing}
            loading={isPublishing}
            loadingText="Publishing..."
          >
            Save and Publish
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleCreate(false)}
            disabled={isSaving || isPublishing}
            loading={isSaving}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
