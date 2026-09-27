import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the sandboxed live-preview host (proxied under *.e2b.app) to talk
  // to the dev server's HMR/dev-asset endpoints. Without this, Next's
  // cross-origin dev-request guard silently blocks /_next/hmr, breaking
  // live reload in the preview iframe.
  allowedDevOrigins: ["*.e2b.app", "**.e2b.app"],
};

export default nextConfig;
