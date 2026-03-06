"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import MediaPicker, {
  type MediaPickerAsset,
  type MediaPickerHandle,
} from "@/components/admin/media-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/http/api-client";
import { useAutoSlug } from "@/lib/hooks/use-slug";
import { useJobDetail } from "@/lib/queries/jobs";
import { queryKeys } from "@/lib/queries/keys";
import type {
  EditableJob,
  FormState,
  JobEditorFormProps,
  JobMetadata,
  JobStatus,
  PrefectureOption,
} from "./types";
import {
  DEFAULT_EDITABLE_JOB,
  STATUS_BADGE_VARIANT,
  STATUS_LABEL,
} from "./constants";
import { formatDate, parseDescriptionHtml, slugifyFromTitle } from "./utils";
import { jobFormSchema } from "./schema";

export default function JobEditorForm(props: JobEditorFormProps) {
  const isCreateMode = props.mode === "create";
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: queryData } = useJobDetail(
    isCreateMode ? "" : props.jobId,
    isCreateMode ? undefined : props.initialData,
    !isCreateMode,
  );

  const job: EditableJob = isCreateMode
    ? {
        ...DEFAULT_EDITABLE_JOB,
        locationPrefectureId: props.prefectures[0]?.id ?? "",
        ...props.job,
      }
    : (queryData!.job as unknown as EditableJob);

  const prefectures: PrefectureOption[] = isCreateMode
    ? props.prefectures
    : (queryData!.prefectures as PrefectureOption[]);

  const availableAssets: MediaPickerAsset[] = isCreateMode
    ? props.availableAssets
    : queryData!.mediaAssets;

  const [form, setForm] = useState<FormState>({
    title: job.title,
    heroImageId: job.heroImageId ?? "",
    locationPrefectureId: job.locationPrefectureId,
    salaryText: job.salaryText,
    benefitsRaw: job.benefits.join("\n"),
    jobDescriptionHtml: parseDescriptionHtml(job.descriptionRich),
  });

  const [currentStatus, setCurrentStatus] = useState<JobStatus>(job.status);
  const [isFeatured, setIsFeatured] = useState<boolean>(job.isFeatured);
  const [publishedAt, setPublishedAt] = useState<string | null>(job.publishAt);
  const [scheduledAt, setScheduledAt] = useState<string | null>(
    job.scheduledAt ?? null,
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(job.updatedAt);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaveAndPublishing, setIsSaveAndPublishing] = useState(false);

  const mediaPickerRef = useRef<MediaPickerHandle>(null);

  const slugState = useAutoSlug(form.title, {
    initialSlug: job.slug,
    entityType: "jobs",
    entityId: isCreateMode ? undefined : job.id,
  });

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

  const applyMutationState = (data: JobMetadata) => {
    setCurrentStatus(data.status);
    setPublishedAt(data.publishAt);
    setScheduledAt(data.scheduledAt);
    setUpdatedAt(data.updatedAt);
  };

  const editJobId = isCreateMode ? "" : props.jobId;

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch<JobMetadata>(`/api/admin/jobs/${editJobId}`, payload),
    onMutate: () => {
      clearFeedback();
      showSuccess("Saving changes...");
    },
    onSuccess: (data) => {
      applyMutationState(data);
      showSuccess("Job post saved.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobs.detail(editJobId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : "Failed to save");
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<{ id: string } & JobMetadata>("/api/admin/jobs", payload),
    onMutate: () => {
      clearFeedback();
      showSuccess("Creating job post...");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      showSuccess("Job post created.");
      router.push(`/admin/jobs/${data.id}`);
      router.refresh();
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : "Failed to create");
    },
  });

  const featureMutation = useMutation({
    mutationFn: (value: boolean) =>
      api.patch<{ id: string; isFeatured: boolean }>(
        `/api/admin/jobs/${editJobId}/feature`,
        { isFeatured: value },
      ),
    onMutate: (value) => {
      clearFeedback();
      setIsFeatured(value);
    },
    onSuccess: (data) => {
      setIsFeatured(data.isFeatured);
      showSuccess(
        data.isFeatured
          ? "Job is now featured on the home page."
          : "Job removed from home page.",
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
    onError: (err) => {
      setIsFeatured(job.isFeatured);
      showError(
        err instanceof Error ? err.message : "Failed to update featured status",
      );
    },
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      api.post<JobMetadata>(`/api/admin/jobs/${editJobId}/publish`),
    onMutate: () => {
      clearFeedback();
      setCurrentStatus("PUBLISHED");
      setPublishedAt(new Date().toISOString());
      setScheduledAt(null);
      showSuccess("Job post published.");
    },
    onSuccess: (data) => {
      applyMutationState(data);
      showSuccess("Job post published.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobs.detail(editJobId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
    onError: (err) => {
      setCurrentStatus(job.status);
      setPublishedAt(job.publishAt);
      setScheduledAt(job.scheduledAt ?? null);
      showError(err instanceof Error ? err.message : "Failed to publish");
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () =>
      api.post<JobMetadata>(`/api/admin/jobs/${editJobId}/unpublish`),
    onMutate: () => {
      clearFeedback();
      setCurrentStatus("DRAFT");
      setPublishedAt(null);
      showSuccess("Job post unpublished.");
    },
    onSuccess: (data) => {
      applyMutationState(data);
      showSuccess("Job post unpublished.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobs.detail(editJobId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
    onError: (err) => {
      setCurrentStatus(job.status);
      setPublishedAt(job.publishAt);
      showError(err instanceof Error ? err.message : "Failed to unpublish");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      api.delete<void>(`/api/admin/jobs/${editJobId}?confirm=true`),
    onMutate: () => clearFeedback(),
    onSuccess: () => {
      showSuccess("Job post deleted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      router.push("/admin/jobs");
      router.refresh();
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : "Failed to delete");
    },
  });

  const isMutating =
    saveMutation.isPending ||
    createMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    deleteMutation.isPending ||
    featureMutation.isPending ||
    isSaveAndPublishing;

  const canPublish = useMemo(
    () =>
      !isCreateMode &&
      (currentStatus === "DRAFT" || currentStatus === "SCHEDULED") &&
      !isMutating,
    [currentStatus, isCreateMode, isMutating],
  );

  const canUnpublish = useMemo(
    () => !isCreateMode && currentStatus === "PUBLISHED" && !isMutating,
    [currentStatus, isCreateMode, isMutating],
  );

  const canDelete = useMemo(
    () => !isCreateMode && !isMutating,
    [isCreateMode, isMutating],
  );

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    const result = jobFormSchema.safeParse({
      title: form.title.trim(),
      locationPrefectureId: form.locationPrefectureId.trim(),
      salaryText: form.salaryText.trim(),
      jobDescriptionHtml: form.jobDescriptionHtml.trim(),
    });
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return null;
  };

  const handleSave = async () => {
    clearFeedback();

    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    let resolvedHeroImageId = form.heroImageId;
    if (mediaPickerRef.current?.hasPendingFile()) {
      try {
        showSuccess("Uploading pending image...");
        const asset = await mediaPickerRef.current.uploadPendingFile();
        if (asset) {
          updateField("heroImageId", asset.id);
          resolvedHeroImageId = asset.id;
        }
      } catch (uploadError) {
        showError(
          uploadError instanceof Error
            ? `Image upload failed: ${uploadError.message}`
            : "Image upload failed.",
        );
        return;
      }
    }

    const benefits = form.benefitsRaw
      .split(/\r?\n/)
      .map((benefit) => benefit.trim())
      .filter((benefit) => benefit.length > 0);

    const resolvedSlug = slugState.slug.trim() || slugifyFromTitle(form.title);
    if (!resolvedSlug) {
      showError("Unable to generate slug from title.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: resolvedSlug,
      heroImageId: resolvedHeroImageId.trim()
        ? resolvedHeroImageId.trim()
        : null,
      locationPrefectureId: form.locationPrefectureId,
      salaryText: form.salaryText.trim(),
      benefits,
      descriptionRich: {
        html: form.jobDescriptionHtml,
      },
    };

    if (isCreateMode) {
      createMutation.mutate(payload);
    } else {
      saveMutation.mutate(payload);
    }
  };

  const handleSaveAndPublish = async () => {
    clearFeedback();

    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    let resolvedHeroImageId = form.heroImageId;
    if (mediaPickerRef.current?.hasPendingFile()) {
      try {
        showSuccess("Uploading pending image...");
        const asset = await mediaPickerRef.current.uploadPendingFile();
        if (asset) {
          updateField("heroImageId", asset.id);
          resolvedHeroImageId = asset.id;
        }
      } catch (uploadError) {
        showError(
          uploadError instanceof Error
            ? `Image upload failed: ${uploadError.message}`
            : "Image upload failed.",
        );
        return;
      }
    }

    const benefits = form.benefitsRaw
      .split(/\r?\n/)
      .map((benefit) => benefit.trim())
      .filter((benefit) => benefit.length > 0);

    const resolvedSlug = slugState.slug.trim() || slugifyFromTitle(form.title);
    if (!resolvedSlug) {
      showError("Unable to generate slug from title.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: resolvedSlug,
      heroImageId: resolvedHeroImageId.trim()
        ? resolvedHeroImageId.trim()
        : null,
      locationPrefectureId: form.locationPrefectureId,
      salaryText: form.salaryText.trim(),
      benefits,
      descriptionRich: {
        html: form.jobDescriptionHtml,
      },
    };

    setIsSaveAndPublishing(true);
    try {
      if (isCreateMode) {
        const created = await api.post<{ id: string } & JobMetadata>(
          "/api/admin/jobs",
          payload,
        );
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
        await api.post<JobMetadata>(`/api/admin/jobs/${created.id}/publish`);
        showSuccess("Job post created and published.");
        router.push(`/admin/jobs/${created.id}`);
        router.refresh();
      } else {
        await saveMutation.mutateAsync(payload);
        await publishMutation.mutateAsync(undefined);
        showSuccess("Job post saved and published.");
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to save and publish",
      );
    } finally {
      setIsSaveAndPublishing(false);
    }
  };

  const handlePublish = () => {
    if (!canPublish) {
      return;
    }

    publishMutation.mutate();
  };

  const handleUnpublish = () => {
    if (!canUnpublish) {
      return;
    }

    unpublishMutation.mutate();
  };

  const handleDelete = () => {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this job permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {!isCreateMode && (
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Post Status</CardTitle>
              <p className="mt-1 text-sm text-slate-600">
                Updated: {formatDate(updatedAt)} | Published:{" "}
                {formatDate(publishedAt)} | Scheduled: {formatDate(scheduledAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isCreateMode &&
                (currentStatus === "PUBLISHED" || isFeatured) && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      disabled={isMutating}
                      onChange={(e) => featureMutation.mutate(e.target.checked)}
                      className="h-4 w-4 accent-cyan-600 disabled:opacity-40"
                    />
                    Feature on home page
                  </label>
                )}
              <Badge variant={STATUS_BADGE_VARIANT[currentStatus]}>
                {STATUS_LABEL[currentStatus]}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">Title</div>
            <Input
              aria-label="Title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Job title"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">Prefecture</div>
            <Select
              value={form.locationPrefectureId}
              onValueChange={(value) =>
                updateField("locationPrefectureId", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select prefecture" />
              </SelectTrigger>
              <SelectContent>
                {prefectures.map((prefecture) => (
                  <SelectItem key={prefecture.id} value={prefecture.id}>
                    {prefecture.nameJP
                      ? `${prefecture.nameJP} - ${prefecture.nameVN}`
                      : prefecture.nameVN}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">Salary</div>
            <Input
              aria-label="Salary"
              value={form.salaryText}
              onChange={(event) =>
                updateField("salaryText", event.target.value)
              }
              onBlur={() =>
                updateField(
                  "salaryText",
                  form.salaryText.replace(/[^\d.\-\s~～]/g, "").trim(),
                )
              }
              placeholder="Monthly salary range"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">
              Benefits (one per line)
            </div>
            <Textarea
              value={form.benefitsRaw}
              onChange={(event) =>
                updateField("benefitsRaw", event.target.value)
              }
              rows={4}
            />
          </div>

          <MediaPicker
            ref={mediaPickerRef}
            label="Image (optional)"
            value={form.heroImageId || null}
            onValueChange={(id) => updateField("heroImageId", id ?? "")}
            availableAssets={availableAssets}
            folder="jobs"
            disabled={isMutating}
          />

          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">Job Description</div>
            <RichTextEditor
              aria-label="Job Description"
              value={form.jobDescriptionHtml}
              onChange={(html) => updateField("jobDescriptionHtml", html)}
              placeholder="Describe the role…"
              disabled={isMutating}
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {feedback ? (
            <p className="text-sm text-emerald-700">{feedback}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {isCreateMode ? (
              <>
                <Button
                  type="button"
                  onClick={handleSaveAndPublish}
                  disabled={isMutating}
                  loading={isSaveAndPublishing}
                  loadingText="Creating & Publishing..."
                >
                  Save and Publish
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={isMutating}
                  loading={createMutation.isPending && !isSaveAndPublishing}
                  loadingText="Creating..."
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isMutating}
                  loading={saveMutation.isPending && !isSaveAndPublishing}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
                {currentStatus === "PUBLISHED" ? (
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
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
