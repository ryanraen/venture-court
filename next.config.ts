import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Hide the floating route/dev panel trigger (bottom-left N) in `next dev` only. */
  devIndicators: false,
};

export default nextConfig;
