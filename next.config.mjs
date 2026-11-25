/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // hide the Next.js "N" badge in local development (never shown on the live site)
  devIndicators: false,
  cacheComponents: true,
  // dashboard uploads go through Server Actions (default limit 1 MB). Allow up to 4.5 MB, the hosting's
  // request limit; pictures are shrunk in the browser first, and files are checked against 4 MB (lib/image.js).
  experimental: {
    serverActions: { bodySizeLimit: '4.5mb' },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
