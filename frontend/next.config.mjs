// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "i.scdn.co",          // Spotify images
      "lastfm.freetls.fastly.net",  // Last.fm images
      "i.ytimg.com",        // YouTube thumbnails
      "i.redd.it",          // Reddit images
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

// Đã sửa dòng này cho chuẩn ES Module của file .mjs
export default nextConfig;