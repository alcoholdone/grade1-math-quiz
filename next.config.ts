import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production" || process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/grade1-math-quiz" : "",
  images: {
    unoptimized: true,
  },
  // ปิด font optimization เพื่อแก้ไขปัญหา Next.js woff2 font โหลด 404 บน subpath ของ GitHub Pages
  optimizeFonts: false,
};

export default nextConfig;
