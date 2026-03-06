import { findNewsHeadlines } from "@/lib/db/repositories/news";

const HOME_NEWS_HEADLINES_LIMIT = 4;

export type HomeNewsHeadlineItem = {
  id: string;
  title: string;
  slug: string;
  category: {
    nameVN: string;
    nameJA: string | null;
  };
  publishAt: Date | null;
};

export async function getHomeNewsHeadlines(
  limit: number = HOME_NEWS_HEADLINES_LIMIT,
): Promise<HomeNewsHeadlineItem[]> {
  return findNewsHeadlines(limit);
}
