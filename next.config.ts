import type { NextConfig } from "next";

// Server build by default (API routes, auth, live sessions).
// STATIC_EXPORT=1 builds the browser-only preview (see scripts/preview.mjs).
const preview = process.env.STATIC_EXPORT === "1";
const nextConfig: NextConfig = {
  ...(preview ? { output: "export" as const, assetPrefix: ".", trailingSlash: true } : {}),
  images: { unoptimized: true },
  poweredByHeader: false,
  ...(preview ? {} : {
    async headers() {
      return [{
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Live video calls run in a Daily room (Tavus) and need camera/mic there.
          { key: "Permissions-Policy", value: 'camera=(self "https://*.daily.co" "https://*.tavus.io"), microphone=(self "https://*.daily.co" "https://*.tavus.io"), display-capture=(self "https://*.daily.co"), geolocation=()' },
        ],
      }];
    },
  }),
};
export default nextConfig;
