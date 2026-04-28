import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppClerkProvider } from "@/components/providers/AppClerkProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Music Intelligence Monitor",
  description: "Real-time music trend analysis powered by AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} bg-bg-primary text-text-primary antialiased`}>
        <ThemeProvider>
          <AppClerkProvider>
            <SWRProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 ml-60 min-h-screen bg-transparent">
                  {children}
                </main>
              </div>
            </SWRProvider>
          </AppClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
