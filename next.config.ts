import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Contact now lives at the bottom of the About page.
  async redirects() {
    return [{ source: "/contact", destination: "/about#contact", permanent: true }];
  },
  images: {
    // SVG placeholders are our own files, so allowing SVG is safe here.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Images uploaded in edit mode live on Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
