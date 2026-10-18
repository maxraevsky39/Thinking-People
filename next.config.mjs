
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }, { protocol: "http", hostname: "82.26.91.140" }], formats: ["image/avif", "image/webp"] },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;