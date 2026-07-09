import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@massifx/core", "@massifx/sdk", "@massifx/agents", "@massifx/data", "@massifx/db"],
  serverExternalPackages: ["@prisma/client"]
};

export default nextConfig;
