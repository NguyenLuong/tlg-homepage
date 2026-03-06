import "server-only";

import { env } from "@/lib/config/env";
import type {
  ImageProvider,
  ImageUploadOptions,
  ImageUploadResult,
  ImageWithBlur,
} from "@/lib/media/image-provider";
import { withBlurPlaceholder } from "@/lib/media/image-provider";
import { CloudinaryImageProvider } from "@/lib/media/providers/cloudinary-provider";

// Re-export types so consumers only need one import path.
export type {
  ImageProvider,
  ImageUploadOptions,
  ImageUploadResult,
  ImageWithBlur,
};
export { withBlurPlaceholder };

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let cachedProvider: ImageProvider | null = null;

/**
 * Return the configured `ImageProvider` singleton.
 *
 * The provider is determined by the optional `IMAGE_PROVIDER` env var
 * (defaults to `"CLOUDINARY"`). Add new providers via the `switch` below.
 */
export function getImageProvider(): ImageProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerKey = env.server.IMAGE_PROVIDER ?? "CLOUDINARY";

  switch (providerKey) {
    case "CLOUDINARY":
      cachedProvider = new CloudinaryImageProvider({
        cloudName: env.server.CLOUDINARY_CLOUD_NAME,
        apiKey: env.server.CLOUDINARY_API_KEY,
        apiSecret: env.server.CLOUDINARY_API_SECRET,
      });
      break;

    default:
      throw new Error(`Unknown image provider: "${providerKey}"`);
  }

  return cachedProvider;
}

// ---------------------------------------------------------------------------
// Convenience wrappers — keep call-sites minimal
// ---------------------------------------------------------------------------

/** Upload an image via the active provider. */
export async function uploadImage(
  file: Blob | string,
  options?: ImageUploadOptions,
): Promise<ImageUploadResult> {
  return getImageProvider().upload(file, options);
}

/** Get a blur-placeholder URL for a given image URL. */
export function getBlurDataURL(imageUrl: string): string {
  return getImageProvider().getBlurDataURL(imageUrl);
}

/** Delete an image from the active provider by its public ID. */
export async function deleteImage(
  publicId: string,
  resourceType?: string,
): Promise<void> {
  return getImageProvider().destroy(publicId, resourceType);
}
