import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for container deployments (Docker / K8s)
  output: "standalone",

  // Compress with Brotli/gzip
  compress: true,

  // Image optimization settings
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800, // 7 days
  },

  // Security and performance headers
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
    {
      source: "/og-image.png",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=604800, immutable",
        },
      ],
    },
  ],

  // API proxy: dev uses localhost rewrite; production may use API_INTERNAL_URL at build
  // or runtime proxy via app/api/[[...path]]/route.ts (Render).
  async rewrites() {
    const apiInternal =
      process.env.API_INTERNAL_URL || process.env.DOCKER_BUILD_API_URL;
    if (apiInternal) {
      const base = apiInternal.replace(/\/$/, "");
      return [
        {
          source: "/api/:path*",
          destination: `${base}/api/:path*`,
        },
      ];
    }
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:4000/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
