import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production" || process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/grade1-math-quiz" : "",
  trailingSlash: true, // บังคับให้ใช้ trailing slash เพื่อแก้ไขปัญหาการอ้างอิง path ใน GitHub Pages
  images: {
    unoptimized: true,
  },
  // ปิด font optimization เพื่อแก้ไขปัญหา Next.js woff2 font โหลด 404 บน subpath ของ GitHub Pages
  optimizeFonts: false,
};

export default nextConfig;
