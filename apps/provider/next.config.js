/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "source.unsplash.com"],
  },
  transpilePackages: ["@marketplace/types"],
};

module.exports = nextConfig;
