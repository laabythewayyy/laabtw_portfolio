/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // hide the Next.js "N" badge in local development (never shown on the live site)
  devIndicators: false,
  cacheComponents: true,
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
