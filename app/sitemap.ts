import type { MetadataRoute } from "next";
import { catalogCategories } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://baraholka-md.vercel.app";
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${baseUrl}/account`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4
    },
    ...catalogCategories.map((category) => ({
      url: `${baseUrl}/categories/${category.id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8
    }))
  ];
}
