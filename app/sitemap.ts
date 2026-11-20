import type { MetadataRoute } from "next";
import { DOCS } from "@/lib/content/docs";
import { LEGAL } from "@/lib/content/legal";
import { FEATURES, MODELS } from "@/lib/content/platform";
import { POSTS } from "@/lib/content/research";
import { SOLUTIONS } from "@/lib/content/solutions";

export const dynamic = "force-static";
const SITE = process.env.PUBLIC_URL || "https://manavos.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "", "/pricing", "/developers", "/enterprise", "/about", "/contact", "/try", "/studio", "/models", "/features", "/docs", "/research",
    ...SOLUTIONS.map((s) => `/solutions/${s.slug}`),
    ...MODELS.map((m) => `/models/${m.slug}`),
    ...FEATURES.map((f) => `/features/${f.slug}`),
    ...DOCS.map((d) => `/docs/${d.slug}`),
    ...POSTS.map((p) => `/research/${p.slug}`),
    ...Object.keys(LEGAL).map((k) => `/legal/${k}`),
  ];
  return [...new Set(paths)].map((p) => ({ url: `${SITE}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));
}
