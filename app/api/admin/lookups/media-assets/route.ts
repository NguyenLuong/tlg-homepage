import { NextRequest } from "next/server";

import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { requireEditor } from "@/lib/auth/request";
import { findRecentMediaAssets } from "@/lib/db/repositories/media";

/**
 * GET /api/admin/lookups/media-assets
 *
 * Returns recent media assets for admin media picker.
 * Optional query param: folder (for filtering by folder in the future)
 */
export async function GET(request: NextRequest) {
  try {
    await requireEditor(request);

    // Optional: Parse folder query param if needed for future filtering
    // const { searchParams } = new URL(request.url);
    // const folder = searchParams.get("folder");

    // For now, just return recent assets
    const mediaAssets = await findRecentMediaAssets();

    // Transform dates to ISO strings for JSON serialization
    const serializedAssets = mediaAssets.map((asset) => ({
      ...asset,
      createdAt: asset.createdAt.toISOString(),
    }));

    return apiAdminOk(serializedAssets);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
