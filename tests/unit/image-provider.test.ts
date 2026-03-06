import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Undo the global image-service mock so we can test the real implementation
// ---------------------------------------------------------------------------
vi.unmock("@/lib/media/image-service");

// ---------------------------------------------------------------------------
// Mock env before any module import that reads it
// ---------------------------------------------------------------------------
vi.mock("@/lib/config/env", () => ({
  env: {
    server: {
      IMAGE_PROVIDER: undefined,
      CLOUDINARY_CLOUD_NAME: "test-cloud",
      CLOUDINARY_API_KEY: "test-key",
      CLOUDINARY_API_SECRET: "test-secret",
    },
  },
}));

// Import after mocks are in place.
import { CloudinaryImageProvider } from "@/lib/media/providers/cloudinary-provider";
import type { ImageProvider } from "@/lib/media/image-provider";
import { withBlurPlaceholder } from "@/lib/media/image-provider";

// ---------------------------------------------------------------------------
// CloudinaryImageProvider — blur placeholder
// ---------------------------------------------------------------------------

describe("CloudinaryImageProvider", () => {
  let provider: CloudinaryImageProvider;

  beforeEach(() => {
    provider = new CloudinaryImageProvider({
      cloudName: "test-cloud",
      apiKey: "test-key",
      apiSecret: "test-secret",
    });
  });

  describe("providerId", () => {
    it("returns CLOUDINARY", () => {
      expect(provider.providerId).toBe("CLOUDINARY");
    });
  });

  describe("getBlurDataURL", () => {
    const TRANSPARENT_PIXEL =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

    it("injects blur transformation into a Cloudinary URL", () => {
      const url =
        "https://res.cloudinary.com/test-cloud/image/upload/v1234567/folder/image.jpg";

      const result = provider.getBlurDataURL(url);

      expect(result).toBe(
        "https://res.cloudinary.com/test-cloud/image/upload/w_40,h_40,q_10,e_blur:1000/v1234567/folder/image.jpg",
      );
    });

    it("returns transparent pixel for non-Cloudinary URLs", () => {
      const url = "https://example.com/images/photo.jpg";

      expect(provider.getBlurDataURL(url)).toBe(TRANSPARENT_PIXEL);
    });

    it("returns transparent pixel for malformed Cloudinary URL (no /upload/)", () => {
      const url =
        "https://res.cloudinary.com/test-cloud/image/fetch/v1/image.jpg";

      expect(provider.getBlurDataURL(url)).toBe(TRANSPARENT_PIXEL);
    });

    it("handles URLs with existing transformations", () => {
      const url =
        "https://res.cloudinary.com/test-cloud/image/upload/c_fill,w_800/v1/image.jpg";

      const result = provider.getBlurDataURL(url);

      expect(result).toBe(
        "https://res.cloudinary.com/test-cloud/image/upload/w_40,h_40,q_10,e_blur:1000/c_fill,w_800/v1/image.jpg",
      );
    });
  });

  describe("getClientConfig", () => {
    it("exposes cloudName and apiKey but not the secret", () => {
      const config = provider.getClientConfig();

      expect(config).toEqual({
        cloudName: "test-cloud",
        apiKey: "test-key",
      });
      expect(Object.keys(config)).not.toContain("apiSecret");
    });
  });
});

// ---------------------------------------------------------------------------
// ImageProvider interface — withBlurPlaceholder helper
// ---------------------------------------------------------------------------

describe("withBlurPlaceholder", () => {
  it("enriches image data with blurDataURL from the provider", () => {
    const fakeProvider: ImageProvider = {
      providerId: "FAKE",
      upload: vi.fn(),
      getBlurDataURL: vi.fn().mockReturnValue("blur://placeholder"),
      getClientConfig: vi.fn(),
    };

    const image = {
      url: "https://example.com/img.jpg",
      altText: "Test image",
      width: 800,
      height: 600,
    };

    const result = withBlurPlaceholder(fakeProvider, image);

    expect(result).toEqual({
      ...image,
      blurDataURL: "blur://placeholder",
    });
    expect(fakeProvider.getBlurDataURL).toHaveBeenCalledWith(image.url);
  });
});

// ---------------------------------------------------------------------------
// getImageProvider factory
// ---------------------------------------------------------------------------

describe("getImageProvider factory", () => {
  beforeEach(() => {
    // Reset the cached singleton between tests by re-importing.
    vi.resetModules();
  });

  it("returns a CloudinaryImageProvider by default", async () => {
    vi.doMock("@/lib/config/env", () => ({
      env: {
        server: {
          IMAGE_PROVIDER: undefined,
          CLOUDINARY_CLOUD_NAME: "my-cloud",
          CLOUDINARY_API_KEY: "key",
          CLOUDINARY_API_SECRET: "secret",
        },
      },
    }));

    const { getImageProvider } = await import("@/lib/media/image-service");
    const provider = getImageProvider();

    expect(provider.providerId).toBe("CLOUDINARY");
  });

  it("returns a CloudinaryImageProvider when IMAGE_PROVIDER is explicitly CLOUDINARY", async () => {
    vi.doMock("@/lib/config/env", () => ({
      env: {
        server: {
          IMAGE_PROVIDER: "CLOUDINARY",
          CLOUDINARY_CLOUD_NAME: "my-cloud",
          CLOUDINARY_API_KEY: "key",
          CLOUDINARY_API_SECRET: "secret",
        },
      },
    }));

    const { getImageProvider } = await import("@/lib/media/image-service");
    const provider = getImageProvider();

    expect(provider.providerId).toBe("CLOUDINARY");
  });

  it("throws for unknown provider", async () => {
    vi.doMock("@/lib/config/env", () => ({
      env: {
        server: {
          IMAGE_PROVIDER: "UNKNOWN_PROVIDER",
          CLOUDINARY_CLOUD_NAME: "c",
          CLOUDINARY_API_KEY: "k",
          CLOUDINARY_API_SECRET: "s",
        },
      },
    }));

    const { getImageProvider } = await import("@/lib/media/image-service");

    expect(() => getImageProvider()).toThrow(
      'Unknown image provider: "UNKNOWN_PROVIDER"',
    );
  });
});
