import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    "192.168.178.102",
    "192.168.178.87",
    "192.168.2.105",
  ],
};

export default nextConfig;
