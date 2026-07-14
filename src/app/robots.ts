import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/console", "/platform", "/org/billing"],
    },
    sitemap: `${siteConfig.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
