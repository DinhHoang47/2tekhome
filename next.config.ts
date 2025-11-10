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
      {
        protocol: "https",
        hostname: "bizweb.dktcdn.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mivietnam.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.gigadigital.vn",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
