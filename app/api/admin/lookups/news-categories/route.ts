import { NextRequest } from "next/server";

import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { requireEditor } from "@/lib/auth/request";
import { findAdminNewsCategories } from "@/lib/db/repositories/lookups";

/**
 * GET /api/admin/lookups/news-categories
 *
 * Returns all news categories for admin dropdowns.
 */
export async function GET(request: NextRequest) {
  try {
    await requireEditor(request);

    const categories = await findAdminNewsCategories();

    return apiAdminOk(categories);
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
