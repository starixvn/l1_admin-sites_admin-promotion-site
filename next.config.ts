import type { NextConfig } from "next";
/**
 * @type {import('next').NextConfig}
 */
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_PROMOTION_URL: process.env.NEXT_PUBLIC_API_PROMOTION_URL,
    NEXT_PUBLIC_API_CONFIGURATION_URL: process.env.NEXT_PUBLIC_API_CONFIGURATION_URL,
    IDENTITY_URL: process.env.IDENTITY_URL,
    IDENTITY_CLIENT_ID: process.env.IDENTITY_CLIENT_ID,
    IDENTITY_CLIENT_SECRET: process.env.IDENTITY_CLIENT_SECRET,
    SCOPE: process.env.SCOPE,
  },
};

export default nextConfig;
