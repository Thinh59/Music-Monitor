"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const fetcher = async (path: string) => {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 5 * 60_000, // 5 minutes — share fetch across remounts
        errorRetryCount: 1,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
