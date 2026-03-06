/**
 * Provider-agnostic image service interface.
 *
 * Implementations live under `lib/media/providers/`.
 * The active provider is resolved by `lib/media/image-service.ts`.
 */

// ---------------------------------------------------------------------------
// Upload types
// ---------------------------------------------------------------------------

export type ImageUploadOptions = {
  folder?: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  tags?: string[];
};

export type ImageUploadResult = {
  assetId: string;
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  bytes: number;
  format?: string;
  resourceType: string;
};

// ---------------------------------------------------------------------------
// Display types
// ---------------------------------------------------------------------------

/** Image data enriched with an optional blur placeholder for Next.js `<Image>`. */
export type ImageWithBlur = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
  blurDataURL?: string;
};

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export interface ImageProvider {
  /** A stable identifier matching the Prisma `MediaProvider` enum value. */
  readonly providerId: string;

  /** Upload a file (Blob or remote URL) and return normalised metadata. */
  upload(
    file: Blob | string,
    options?: ImageUploadOptions,
  ): Promise<ImageUploadResult>;

  /**
   * Derive a tiny blurred placeholder URL/data-URI from an image URL.
   *
   * The result is passed to Next.js `<Image placeholder="blur">`.
   */
  getBlurDataURL(imageUrl: string): string;

  /**
   * Delete an asset by its public ID.
   *
   * Implementations should be idempotent — deleting a non-existent asset
   * must not throw.
   */
  destroy(publicId: string, resourceType?: string): Promise<void>;

  /**
   * Return provider-specific config that is safe to expose to the client
   * (e.g. cloud name, public API key — never secrets).
   */
  getClientConfig(): Record<string, string>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Enrich raw image data with a blur placeholder via the active provider. */
export function withBlurPlaceholder(
  provider: ImageProvider,
  image: { url: string; altText: string | null; width: number; height: number },
): ImageWithBlur {
  return {
    ...image,
    blurDataURL: provider.getBlurDataURL(image.url),
  };
}
