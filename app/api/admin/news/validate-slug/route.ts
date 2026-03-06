import { NextRequest, NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth/request";
import { prisma } from "@/lib/db/prisma";
import { makeSlugUnique, generateSlug } from "@/lib/utils/slug";

/**
 * POST /api/admin/news/validate-slug
 * Validates and generates a unique slug for a news post.
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

    // Get all existing news slugs, excluding the current one if editing
    const existingNews = await prisma.newsPost.findMany({
      where: currentId
        ? {
            id: { not: currentId },
          }
        : undefined,
      select: { slug: true },
    });

    const existingSlugs = existingNews.map(
      (news: { slug: string }) => news.slug,
    );

    // Generate unique slug
    const uniqueSlug = makeSlugUnique(baseSlug, existingSlugs);

    return NextResponse.json({ data: { slug: uniqueSlug } });
  } catch (error) {
    console.error("Error validating news slug:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 },
    );
  }
}
