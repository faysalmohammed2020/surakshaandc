import type { NextConfig } from "next";
import { categories, services, posts } from "./data/content";

const nextConfig: NextConfig = {
  images: {
    // Existing images are served from the current site.
    // Once you move images into /public, you can remove this.
    remotePatterns: [{ protocol: "https", hostname: "www.surakshaandc.com" }],
  },

  // Keep old URLs working (SEO): every old page 301-redirects to its new home.
  async redirects() {
    const r = [
      { source: "/service", destination: "/services", permanent: true },
      { source: "/news", destination: "/blog", permanent: true },
      { source: "/photo-gallery", destination: "/gallery", permanent: true },
      { source: "/management-message", destination: "/about#founder", permanent: true },
      { source: "/management-team", destination: "/about#team", permanent: true },
      { source: "/doctors", destination: "/about#team", permanent: true },
      { source: "/patient-register", destination: "/appointment", permanent: true },
      { source: "/diagonestic", destination: "/services", permanent: true },
      { source: "/test-service", destination: "/services", permanent: true },
      ...categories.map((c) => ({
        source: `/category-service/${c.oldSlug}`,
        destination: `/services/${c.slug}`,
        permanent: true,
      })),
      ...services.map((s) => ({
        source: `/service/${s.slug}`,
        destination: `/services/${s.category}/${s.slug}`,
        permanent: true,
      })),
      ...posts.map((p) => ({
        source: `/news/${p.oldSlug}`,
        destination: `/blog/${p.slug}`,
        permanent: true,
      })),
    ];
    return r;
  },
};

export default nextConfig;
