"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Globe2,
  Flame,
  Target,
  Newspaper,
  MessageSquare,
  Music2,
  Sparkles,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/briefing", label: "Briefing", icon: Newspaper },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/insight", label: "Market Insight", icon: Sparkles },
  { href: "/map", label: "World Map", icon: Globe2 },
  { href: "/trends", label: "Trending", icon: Flame },
  { href: "/predict", label: "Prediction", icon: Target },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-60 bg-bg-card border-r border-border flex flex-col py-6 px-4 fixed h-full z-10 backdrop-blur">
      <Link href="/" className="mb-8 px-2 group">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-aurora flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Music2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold gradient-text">MusicMonitor</span>
            <p className="text-[10px] text-text-muted">Global Intelligence</p>
          </div>
        </div>
      </Link>

      <div className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                active
                  ? "bg-gradient-card text-text-primary border border-accent-purple/30"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-accent-purple" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                  userButtonPopoverCard:
                    "bg-bg-card border border-border shadow-card",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-xs px-3 py-2 rounded-lg bg-gradient-aurora text-white font-semibold flex-1">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed px-1">
          Last.fm · YouTube · Reddit · Spotify
          <br />
          AI: Gemini 3.1 Flash-Lite
        </p>
      </div>
    </nav>
  );
}
