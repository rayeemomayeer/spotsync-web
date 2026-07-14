import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo/site";

const paths = [
  "/",
  "/search",
  "/pricing",
  "/how-it-works",
  "/developers",
  "/legal/privacy",
  "/legal/terms",
  "/login",
  "/signup",
  "/driver",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
