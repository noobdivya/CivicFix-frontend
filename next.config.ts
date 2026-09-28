import type { NextConfig } from "next";

// The browser calls /api and /uploads on the frontend's own domain and Next.js
// forwards them to the backend. Keeping everything on one domain lets the staff
// session cookie work (the backend is on another site).
const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
