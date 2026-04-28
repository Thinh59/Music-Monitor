"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useEffect, useState, type ReactNode } from "react";

export function AppClerkProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "#a855f7",
          colorBackground: isDark ? "#0c0d0f" : "#ffffff",
          colorInputBackground: isDark ? "#1a1b1e" : "#f5f5f7",
          colorText: isDark ? "#f0f0f5" : "#111118",
          colorTextSecondary: isDark ? "#c0c0c8" : "#3c3c48",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-bg-card border border-border rounded-xl shadow-card",
          formButtonPrimary:
            "bg-gradient-aurora hover:opacity-90 transition-opacity normal-case font-semibold",
          headerTitle: "text-text-primary",
          headerSubtitle: "text-text-secondary",
          socialButtonsBlockButton:
            "bg-bg-elevated border-border hover:bg-bg-secondary",
          formFieldInput:
            "bg-bg-elevated border-border text-text-primary placeholder:text-text-muted",
          footerActionLink: "text-accent-purple hover:text-accent-blue",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
