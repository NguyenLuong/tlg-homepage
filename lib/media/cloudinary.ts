/**
 * @deprecated Import from `@/lib/media/image-service` instead.
 *
 * This file is kept only for backward compatibility and will be removed
 * in a future cleanup pass.
 */
import "server-only";

import { getImageProvider, uploadImage } from "@/lib/media/image-service";
import type {
  ImageUploadOptions,
  ImageUploadResult,
} from "@/lib/media/image-provider";

/** @deprecated Use `ImageUploadOptions` from `@/lib/media/image-provider`. */
export type CloudinaryUploadOptions = ImageUploadOptions;

/** @deprecated Use `ImageUploadResult` from `@/lib/media/image-provider`. */
export type CloudinaryUploadResult = ImageUploadResult;

/** @deprecated Use `getImageProvider().getClientConfig()` instead. */
export function getCloudinaryClientConfig() {
  return getImageProvider().getClientConfig();
}

/** @deprecated Use `uploadImage()` from `@/lib/media/image-service`. */
export async function uploadToCloudinary(
  file: Blob | string,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
  return uploadImage(file, options);
}
