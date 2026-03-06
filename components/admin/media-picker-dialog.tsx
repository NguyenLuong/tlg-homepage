"use client";

import { useState } from "react";
import { X, Check, Trash2 } from "lucide-react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { MediaPickerAsset } from "./media-picker";

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: MediaPickerAsset[];
  selectedValue: string | null;
  onSelect: (assetId: string | null) => void;
  onDelete?: (assetId: string) => Promise<void>;
  disabled?: boolean;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  assets,
  selectedValue,
  onSelect,
  onDelete,
  disabled = false,
}: MediaPickerDialogProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (event: React.MouseEvent, assetId: string) => {
    event.stopPropagation();
    if (!onDelete || deletingId) return;

    setDeletingId(assetId);
    onDelete(assetId).finally(() => setDeletingId(null));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Select Cover Image</DialogTitle>
          <DialogDescription>
            Choose an image from your media library
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {assets.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No images available. Upload a new image below.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => onSelect(null)}
                className={`group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors hover:border-slate-400 hover:bg-slate-50 ${
                  !selectedValue
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300"
                }`}
                disabled={disabled}
              >
                <X className="h-8 w-8 text-slate-400 group-hover:text-slate-600" />
                <div className="mt-2 text-xs font-medium text-slate-600">
                  No Image
                </div>
                {!selectedValue && (
                  <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onSelect(asset.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-lg border-2 transition-all hover:border-blue-400 hover:shadow-md ${
                    selectedValue === asset.id
                      ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2"
                      : "border-slate-200"
                  }`}
                  disabled={disabled || deletingId === asset.id}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                    <Image
                      src={asset.url}
                      alt={asset.altText ?? "Media"}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {onDelete && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleDelete(e, asset.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleDelete(
                              e as unknown as React.MouseEvent,
                              asset.id,
                            );
                          }
                        }}
                        className="absolute left-2 top-2 z-10 rounded-full bg-red-600/80 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-700 group-hover:opacity-100 disabled:cursor-not-allowed"
                        aria-label="Delete image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-left">
                    <div className="truncate text-xs font-medium text-slate-700">
                      {asset.altText || asset.publicId}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {asset.width}×{asset.height}
                    </div>
                  </div>
                  {selectedValue === asset.id && (
                    <div className="absolute right-2 top-2 rounded-full bg-blue-500 p-1 shadow-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
