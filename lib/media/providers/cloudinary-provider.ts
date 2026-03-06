import "server-only";

import { createHash } from "node:crypto";

import type {
  ImageProvider,
  ImageUploadOptions,
  ImageUploadResult,
} from "@/lib/media/image-provider";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLOUDINARY_UPLOAD_API = "https://api.cloudinary.com/v1_1";

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export type CloudinaryProviderConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class CloudinaryImageProvider implements ImageProvider {
  readonly providerId = "CLOUDINARY" as const;

  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(config: CloudinaryProviderConfig) {
    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  // -----------------------------------------------------------------------
  // ImageProvider — upload
  // -----------------------------------------------------------------------

  async upload(
    file: Blob | string,
    options: ImageUploadOptions = {},
  ): Promise<ImageUploadResult> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const tags = options.tags?.join(",") ?? "";

    const signedParams: Record<string, string> = {
      timestamp,
      folder: options.folder ?? "",
      public_id: options.publicId ?? "",
      tags,
    };

    const body = new FormData();
    body.set("file", file);
    body.set("api_key", this.apiKey);
    body.set("timestamp", timestamp);
    body.set("signature", this.signParams(signedParams));

    if (signedParams.folder) body.set("folder", signedParams.folder);
    if (signedParams.public_id) body.set("public_id", signedParams.public_id);
    if (signedParams.tags) body.set("tags", signedParams.tags);

    const url = this.toUploadApiUrl(options.resourceType);
    const response = await fetch(url, { method: "POST", body });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cloudinary upload failed (${response.status}): ${errorText}`,
      );
    }

    const payload = (await response.json()) as {
      asset_id: string;
      public_id: string;
      secure_url: string;
      width?: number;
      height?: number;
      bytes: number;
      format?: string;
      resource_type: string;
    };

    return {
      assetId: payload.asset_id,
      publicId: payload.public_id,
      secureUrl: payload.secure_url,
      width: payload.width,
      height: payload.height,
      bytes: payload.bytes,
      format: payload.format,
      resourceType: payload.resource_type,
    };
  }

  // -----------------------------------------------------------------------
  // ImageProvider — destroy
  // -----------------------------------------------------------------------

  async destroy(publicId: string, resourceType = "image"): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const signedParams: Record<string, string> = {
      public_id: publicId,
      timestamp,
    };

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp,
      api_key: this.apiKey,
      signature: this.signParams(signedParams),
    });

    const url = `${CLOUDINARY_UPLOAD_API}/${this.cloudName}/${resourceType}/destroy`;
    const response = await fetch(url, { method: "POST", body });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cloudinary destroy failed (${response.status}): ${errorText}`,
      );
    }
  }

  // -----------------------------------------------------------------------
  // ImageProvider — blur placeholder
  // -----------------------------------------------------------------------

  getBlurDataURL(imageUrl: string): string {
    if (!imageUrl.includes("res.cloudinary.com")) {
      return TRANSPARENT_PIXEL;
    }

    const urlParts = imageUrl.split("/upload/");
    if (urlParts.length !== 2) {
      return TRANSPARENT_PIXEL;
    }

    const blurTransformation = "w_40,h_40,q_10,e_blur:1000";
    return `${urlParts[0]}/upload/${blurTransformation}/${urlParts[1]}`;
  }

  // -----------------------------------------------------------------------
  // ImageProvider — client config
  // -----------------------------------------------------------------------

  getClientConfig(): Record<string, string> {
    return {
      cloudName: this.cloudName,
      apiKey: this.apiKey,
    };
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private signParams(params: Record<string, string>): string {
    const payload = Object.entries(params)
      .filter(([, value]) => value.length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return createHash("sha1")
      .update(`${payload}${this.apiSecret}`)
      .digest("hex");
  }

  private toUploadApiUrl(
    resourceType: ImageUploadOptions["resourceType"],
  ): string {
    return `${CLOUDINARY_UPLOAD_API}/${this.cloudName}/${resourceType ?? "auto"}/upload`;
  }
}
