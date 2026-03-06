import { NextRequest, NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth/request";
import { prisma } from "@/lib/db/prisma";
import { makeSlugUnique, generateSlug } from "@/lib/utils/slug";

/**
 * POST /api/admin/jobs/validate-slug
 * Validates and generates a unique slug for a job post.
 */
export async function POST(request: NextRequest) {
  try {
    await requireEditor(request);

    const body = await request.json();
    const { title, currentId } = body as {
      title?: string;
      currentId?: string;
    };

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: { message: "Title is required" } },
        { status: 400 },
      );
    }

    // Generate base slug from title
    const baseSlug = generateSlug(title);

    if (!baseSlug) {
      return NextResponse.json(
        { error: { message: "Unable to generate slug from title" } },
        { status: 400 },
      );
    }

    // Get all existing job slugs, excluding the current one if editing
    const existingJobs = await prisma.jobPost.findMany({
      where: currentId
        ? {
            id: { not: currentId },
          }
        : undefined,
      select: { slug: true },
    });

    const existingSlugs = existingJobs.map((job: { slug: string }) => job.slug);

    // Generate unique slug
    const uniqueSlug = makeSlugUnique(baseSlug, existingSlugs);

    return NextResponse.json({ data: { slug: uniqueSlug } });
  } catch (error) {
    console.error("Error validating job slug:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
