import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Evitar el Prerender
  // swcMinify: false,       // 
  output: "standalone",   //
};

export default nextConfig;
