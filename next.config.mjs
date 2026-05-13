/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  compress: true,
};

export default nextConfig;