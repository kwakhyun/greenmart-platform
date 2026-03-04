/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@greenmart/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
