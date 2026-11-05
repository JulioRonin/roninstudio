import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El diseño de referencia (musashi/design) no forma parte del build.
  outputFileTracingExcludes: { "*": ["./design/**"] },
};

export default nextConfig;
