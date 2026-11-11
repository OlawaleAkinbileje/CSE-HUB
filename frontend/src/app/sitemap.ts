import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production" || !siteUrl) return [];

  const publicRoutes = [
    "",
    "/about",
    "/search",
    "/knowledge",
    "/projects",
    "/past-questions",
    "/code-preview",
  ];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/search" ? 0.9 : 0.7,
  }));
}
