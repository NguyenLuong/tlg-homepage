import { beforeEach, describe, expect, it, vi } from "vitest";

const lookupRepositoriesMock = vi.hoisted(() => ({
  findAdminNewsCategories: vi.fn(),
  findAdminPrefectures: vi.fn(),
}));

const mediaRepositoriesMock = vi.hoisted(() => ({
  findRecentMediaAssets: vi.fn(),
}));

const authRequestMock = vi.hoisted(() => ({
  requireEditor: vi.fn(),
}));

vi.mock("@/lib/db/repositories/lookups", () => lookupRepositoriesMock);
vi.mock("@/lib/db/repositories/media", () => mediaRepositoriesMock);
vi.mock("@/lib/auth/request", () => authRequestMock);

import { GET as getNewsCategories } from "@/app/api/admin/lookups/news-categories/route";
import { GET as getPrefectures } from "@/app/api/admin/lookups/prefectures/route";
import { GET as getMediaAssets } from "@/app/api/admin/lookups/media-assets/route";

describe("Admin Lookups API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authRequestMock.requireEditor.mockResolvedValue(undefined);
  });

  describe("GET /api/admin/lookups/news-categories", () => {
    it("should return news categories", async () => {
      const mockCategories = [
        { id: "1", nameVN: "Company News" },
        { id: "2", nameVN: "Recruitment News" },
      ];

      lookupRepositoriesMock.findAdminNewsCategories.mockResolvedValue(
        mockCategories,
      );

      const request = new Request(
        "http://localhost/api/admin/lookups/news-categories",
      );
      const response = await getNewsCategories(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockCategories });
      expect(authRequestMock.requireEditor).toHaveBeenCalledWith(request);
      expect(lookupRepositoriesMock.findAdminNewsCategories).toHaveBeenCalled();
    });

    it("should require authentication", async () => {
      authRequestMock.requireEditor.mockRejectedValue(
        new Error("Unauthorized"),
      );

      const request = new Request(
        "http://localhost/api/admin/lookups/news-categories",
      );
      const response = await getNewsCategories(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe("GET /api/admin/lookups/prefectures", () => {
    it("should return prefectures", async () => {
      const mockPrefectures = [
        { id: "1", nameJP: "東京都", nameVN: "Tokyo", code: "13" },
        { id: "2", nameJP: "大阪府", nameVN: "Osaka", code: "27" },
      ];

      lookupRepositoriesMock.findAdminPrefectures.mockResolvedValue(
        mockPrefectures,
      );

      const request = new Request(
        "http://localhost/api/admin/lookups/prefectures",
      );
      const response = await getPrefectures(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: mockPrefectures });
      expect(authRequestMock.requireEditor).toHaveBeenCalledWith(request);
      expect(lookupRepositoriesMock.findAdminPrefectures).toHaveBeenCalled();
    });
  });

  describe("GET /api/admin/lookups/media-assets", () => {
    it("should return media assets with serialized dates", async () => {
      const mockAssets = [
        {
          id: "1",
          url: "https://example.com/image1.jpg",
          publicId: "image1",
          altText: "Test Image 1",
          width: 1920,
          height: 1080,
          bytes: 123456,
          mime: "image/jpeg",
          createdAt: new Date("2026-02-01T10:00:00.000Z"),
        },
        {
          id: "2",
          url: "https://example.com/image2.png",
          publicId: "image2",
          altText: "Test Image 2",
          width: 800,
          height: 600,
          bytes: 654321,
          mime: "image/png",
          createdAt: new Date("2026-02-02T12:00:00.000Z"),
        },
      ];

      mediaRepositoriesMock.findRecentMediaAssets.mockResolvedValue(mockAssets);

      const request = new Request(
        "http://localhost/api/admin/lookups/media-assets",
      );
      const response = await getMediaAssets(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].createdAt).toBe("2026-02-01T10:00:00.000Z");
      expect(data.data[1].createdAt).toBe("2026-02-02T12:00:00.000Z");
      expect(authRequestMock.requireEditor).toHaveBeenCalledWith(request);
      expect(mediaRepositoriesMock.findRecentMediaAssets).toHaveBeenCalled();
    });

    it("should handle empty media assets array", async () => {
      mediaRepositoriesMock.findRecentMediaAssets.mockResolvedValue([]);

      const request = new Request(
        "http://localhost/api/admin/lookups/media-assets",
      );
      const response = await getMediaAssets(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: [] });
    });
  });
});
