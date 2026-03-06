import type { MetadataRoute } from "next";

import { findPublishedJobsForSitemap } from "@/lib/db/repositories/jobs";
import { findPublishedNewsForSitemap } from "@/lib/db/repositories/news";

function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3456";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const [newsPosts, jobPosts] = await Promise.all([
    findPublishedNewsForSitemap(now),
    findPublishedJobsForSitemap(now),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const newsEntries: MetadataRoute.Sitemap = newsPosts.map((post) => ({
    url: `${baseUrl}/news/${post.slug}`,
    lastModified: post.publishAt ?? post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const jobEntries: MetadataRoute.Sitemap = jobPosts.map((post) => ({
    url: `${baseUrl}/jobs/${post.slug}`,
    lastModified: post.publishAt ?? post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...newsEntries, ...jobEntries];
}
