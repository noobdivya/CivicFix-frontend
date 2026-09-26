import type { NextConfig } from "next";

// In production the browser calls /api and /uploads on the frontend's own
// domain and Next.js forwards them to the backend. Keeping everything on one
// domain lets the staff session cookie work (the backend is on another site).
const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) return [];
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
