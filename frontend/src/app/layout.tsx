import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Music Intelligence Monitor",
  description: "Real-time music trend analysis powered by AI",
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "📊 Dashboard" },
  { href: "/map",       label: "🗺️ World Map"  },
  { href: "/trends",    label: "🔥 Trending"   },
  { href: "/predict",   label: "🎯 Prediction" },
  { href: "/briefing",  label: "📰 Briefing"   },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      {/* Thêm nền đen và chữ sáng màu cho toàn bộ body */}
      <body className={`${inter.className} bg-[#0c0d0f] text-gray-200`}>
        {/* Sidebar navigation */}
        <div className="flex min-h-screen">
          {/* Sửa bg-white thành nền tối (bg-[#121212]), viền tối */}
          <nav className="w-56 bg-[#121212] border-r border-gray-800 flex flex-col py-6 px-4 fixed h-full z-10">
            <div className="mb-8 px-2">
              {/* Sửa chữ thành màu trắng */}
              <span className="text-lg font-bold text-white">🎵 MusicMonitor</span>
              <p className="text-xs text-gray-400 mt-0.5">Global Intelligence</p>
            </div>
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  // Sửa hiệu ứng hover cho hợp với giao diện tối
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 
                             hover:bg-gray-800 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto px-2">
              <p className="text-xs text-gray-500">
                Data: Last.fm · YouTube<br />
                Reddit · MusicBrainz<br />
                AI: Gemini 3.1 Flash-Lite
              </p>
            </div>
          </nav>
          {/* Xóa bg-gray-50, để bg-transparent cho lòi cái nền đen của body ra */}
          <main className="flex-1 ml-56 min-h-screen bg-transparent">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}