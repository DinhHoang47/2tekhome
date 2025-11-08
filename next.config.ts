import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.tgdd.vn",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
