/**
 * @deprecated Import from `@/lib/media/image-service` instead.
 *
 * This file is kept only for backward compatibility and will be removed
 * in a future cleanup pass.
 */
import { getBlurDataURL } from "@/lib/media/image-service";
import type { ImageWithBlur } from "@/lib/media/image-provider";

/** @deprecated Use `ImageWithBlur` from `@/lib/media/image-provider`. */
export type { ImageWithBlur };

/** @deprecated Use `getBlurDataURL()` from `@/lib/media/image-service`. */
export function getCloudinaryBlurDataURL(imageUrl: string): string {
  return getBlurDataURL(imageUrl);
}

/** @deprecated Use `withBlurPlaceholder()` from `@/lib/media/image-service`. */
export function withBlurPlaceholder(image: {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}): ImageWithBlur {
  return {
    ...image,
    blurDataURL: getBlurDataURL(image.url),
  };
}
