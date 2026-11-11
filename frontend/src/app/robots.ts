import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const isIndexableDeployment = process.env.NODE_ENV === "production" && Boolean(siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: isIndexableDeployment ? "/" : undefined,
      disallow: isIndexableDeployment
        ? [
            "/admin/",
            "/staff/",
            "/student/",
            "/profile/",
            "/my-resources/",
            "/notifications/",
            "/support/",
            "/login",
            "/register",
            "/auth/",
          ]
        : "/",
    },
    sitemap: isIndexableDeployment ? `${siteUrl}/sitemap.xml` : undefined,
    host: isIndexableDeployment ? siteUrl : undefined,
  };
}
