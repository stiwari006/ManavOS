import type { NextConfig } from "next";

// Server build by default (API routes, auth, live sessions).
// STATIC_EXPORT=1 builds the browser-only preview (see scripts/preview.mjs).
const preview = process.env.STATIC_EXPORT === "1";
const nextConfig: NextConfig = {
  ...(preview ? { output: "export" as const, assetPrefix: ".", trailingSlash: true } : {}),
  images: { unoptimized: true },
};
export default nextConfig;
