import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.CLOUDFLARE_BUILD === "1",
  },
  ...(process.env.CLOUDFLARE_BUILD === "1" ? {
    turbopack: {
      resolveAlias: { undici: "./scripts/cloudflare-fetch.mjs" },
    },
  } : {}),
  devIndicators: false,
  allowedDevOrigins: [
    "192.168.178.95",
    "denver-sir-discussions-logs.trycloudflare.com",
    "192.168.178.102",
    "192.168.178.87",
    "192.168.2.105",
  ],
};

export default nextConfig;
