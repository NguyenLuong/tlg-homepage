import { NextRequest } from "next/server";

import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { requireEditor } from "@/lib/auth/request";
import { findAdminPrefectures } from "@/lib/db/repositories/lookups";

/**
 * GET /api/admin/lookups/prefectures
 *
 * Returns all prefectures for admin dropdowns.
 */
export async function GET(request: NextRequest) {
  try {
    await requireEditor(request);

    const prefectures = await findAdminPrefectures();

    return apiAdminOk(prefectures);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
