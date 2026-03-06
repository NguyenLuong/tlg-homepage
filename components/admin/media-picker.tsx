"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { X, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { MediaPickerDialog } from "./media-picker-dialog";

export type MediaPickerAsset = {
  id: string;
  url: string;
  publicId: string;
  altText: string | null;
  width: number;
  height: number;
  bytes: number;
  mime: string;
  createdAt: string;
};

type MediaPickerProps = {
  value: string | null;
  onValueChange: (id: string | null, asset: MediaPickerAsset | null) => void;
  availableAssets?: MediaPickerAsset[];
  label?: string;
  folder?: string;
  disabled?: boolean;
};

export type MediaPickerHandle = {
  /** Upload the pending file (if any) and return the created asset, or null if nothing to upload. */
  uploadPendingFile: () => Promise<MediaPickerAsset | null>;
  /** Whether a file is currently selected but not yet uploaded. */
  hasPendingFile: () => boolean;
};

type ApiSuccessResponse<T> = {
  data: T;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const json = (await response.json()) as ApiErrorResponse;
    const message = json.error?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  } catch {
    // no-op: fallback below
  }

  return `Upload failed with status ${response.status}.`;
}

function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

const MediaPicker = forwardRef<MediaPickerHandle, MediaPickerProps>(
  function MediaPicker(
    {
      value,
      onValueChange,
      availableAssets,
      label = "Cover Image",
      folder,
      disabled = false,
    },
    ref,
  ) {
    const [uploadedAssets, setUploadedAssets] = useState<MediaPickerAsset[]>(
      [],
    );
    const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
    const [altText, setAltText] = useState("");
    const [tagsRaw, setTagsRaw] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isUploading, startUploadingTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Ref-based upload for external callers (e.g. form submit)
    const selectedFileRef = useRef<File | null>(null);
    const altTextRef = useRef("");
    const tagsRawRef = useRef("");

    // Keep refs in sync with state via effect
    useEffect(() => {
      selectedFileRef.current = selectedFile;
    }, [selectedFile]);
    useEffect(() => {
      altTextRef.current = altText;
    }, [altText]);
    useEffect(() => {
      tagsRawRef.current = tagsRaw;
    }, [tagsRaw]);

    useImperativeHandle(ref, () => ({
      hasPendingFile: () => selectedFileRef.current !== null,
      uploadPendingFile: async () => {
        const file = selectedFileRef.current;
        if (!file) return null;

        const formData = new FormData();
        formData.append("file", file);

        const normalizedAlt = altTextRef.current.trim();
        if (normalizedAlt) {
          formData.append("altText", normalizedAlt);
        }

        if (folder && folder.trim()) {
          formData.append("folder", folder.trim());
        }

        const uniqueTags = Array.from(
          new Set(
            tagsRawRef.current
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0),
          ),
        );
        for (const tag of uniqueTags) {
          formData.append("tags", tag);
        }

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorMessage = await parseErrorMessage(response);
          throw new Error(errorMessage);
        }

        const result =
          (await response.json()) as ApiSuccessResponse<MediaPickerAsset>;
        const createdAsset = result.data;

        // Update internal state
        setUploadedAssets((prev) => [
          createdAsset,
          ...prev.filter((asset) => asset.id !== createdAsset.id),
        ]);
        onValueChange(createdAsset.id, createdAsset);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setAltText("");
        setTagsRaw("");
        setFeedback("Image uploaded and selected.");

        return createdAsset;
      },
    }));

    const assets = useMemo(() => {
      const merged = [...uploadedAssets, ...(availableAssets ?? [])];
      const byId = new Map<string, MediaPickerAsset>();
      for (const asset of merged) {
        if (!byId.has(asset.id) && !deletedIds.has(asset.id)) {
          byId.set(asset.id, asset);
        }
      }
      return Array.from(byId.values());
    }, [availableAssets, uploadedAssets, deletedIds]);

    const selectedAsset = useMemo(
      () => assets.find((asset) => asset.id === value) ?? null,
      [assets, value],
    );

    const updateSelectedAsset = (nextValue: string | null) => {
      if (!nextValue) {
        onValueChange(null, null);
        setIsModalOpen(false);
        return;
      }

      const matched = assets.find((asset) => asset.id === nextValue) ?? null;
      onValueChange(nextValue, matched);
      setIsModalOpen(false);
    };

    const handleDeleteAsset = async (assetId: string) => {
      setError(null);
      setFeedback(null);

      // Optimistic: remove immediately from UI
      const previousUploaded = uploadedAssets;
      const previousDeletedIds = deletedIds;
      const wasSelected = value === assetId;

      setUploadedAssets((prev) => prev.filter((a) => a.id !== assetId));
      setDeletedIds((prev) => new Set(prev).add(assetId));
      if (wasSelected) {
        onValueChange(null, null);
      }

      const response = await fetch(`/api/media/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Roll back on failure
        setUploadedAssets(previousUploaded);
        setDeletedIds(previousDeletedIds);
        setError(await parseErrorMessage(response));
        return;
      }

      setFeedback("Image deleted permanently.");
    };

    const handleUpload = () => {
      if (!selectedFile || disabled) {
        return;
      }

      startUploadingTransition(async () => {
        setError(null);
        setFeedback(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        const normalizedAltText = altText.trim();
        if (normalizedAltText) {
          formData.append("altText", normalizedAltText);
        }

        if (folder && folder.trim()) {
          formData.append("folder", folder.trim());
        }

        const uniqueTags = Array.from(
          new Set(
            tagsRaw
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0),
          ),
        );
        for (const tag of uniqueTags) {
          formData.append("tags", tag);
        }

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          setError(await parseErrorMessage(response));
          return;
        }

        const result =
          (await response.json()) as ApiSuccessResponse<MediaPickerAsset>;
        const createdAsset = result.data;

        setUploadedAssets((prev) => [
          createdAsset,
          ...prev.filter((asset) => asset.id !== createdAsset.id),
        ]);
        onValueChange(createdAsset.id, createdAsset);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setAltText("");
        setTagsRaw("");
        setFeedback("Image uploaded and selected.");
      });
    };

    const handleFileChange = (file: File | null) => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      setSelectedFile(file);
      setError(null);
      setFeedback(null);

      if (file) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }
    };

    const clearPreview = () => {
      handleFileChange(null);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="font-medium text-slate-700">{label}</div>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              disabled={disabled}
              onClick={() => setIsModalOpen(true)}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {selectedAsset
                ? `Selected: ${selectedAsset.altText || selectedAsset.publicId}`
                : "Select an image"}
            </Button>
            <MediaPickerDialog
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              assets={assets}
              selectedValue={value}
              onSelect={updateSelectedAsset}
              onDelete={handleDeleteAsset}
              disabled={disabled}
            />
          </div>

          {selectedAsset ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <Image
                src={selectedAsset.url}
                alt={selectedAsset.altText ?? "Selected media"}
                width={selectedAsset.width}
                height={selectedAsset.height}
                className="h-40 w-fit rounded-lg object-cover"
              />
              <div className="mt-2 space-y-1 text-xs text-slate-600">
                <p>ID: {selectedAsset.id}</p>
                <p>
                  Size: {selectedAsset.width}x{selectedAsset.height} |{" "}
                  {formatBytes(selectedAsset.bytes)}
                </p>
                <p>MIME: {selectedAsset.mime}</p>
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateSelectedAsset(null)}
                  disabled={disabled}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          ) : null}

          <div className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">
              Upload new image
            </p>
            <div className="space-y-2 text-sm">
              <div className=" text-slate-700">Image File</div>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
                disabled={disabled || isUploading}
              />
            </div>
            {previewUrl && selectedFile ? (
              <div className="rounded-lg border w-fit border-slate-200 bg-white p-2">
                <div className="group relative">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="h-40 w-full rounded object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearPreview}
                    disabled={disabled || isUploading}
                    className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-slate-900 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
                    aria-label="Clear image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Preview: {selectedFile.name} ({formatBytes(selectedFile.size)}
                  )
                </p>
              </div>
            ) : null}
            <div className="space-y-2 text-sm">
              <div className=" text-slate-700">Alt Text (optional)</div>
              <Input
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                placeholder="Short accessible image description"
                disabled={disabled || isUploading}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className=" text-slate-700">
                Tags (optional, comma-separated)
              </div>
              <Textarea
                value={tagsRaw}
                onChange={(event) => setTagsRaw(event.target.value)}
                rows={2}
                placeholder="news, hero, hiring"
                disabled={disabled || isUploading}
              />
            </div>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || disabled || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {feedback ? (
            <p className="text-sm text-emerald-700">{feedback}</p>
          ) : null}
        </CardContent>
      </Card>
    );
  },
);

export default MediaPicker;
