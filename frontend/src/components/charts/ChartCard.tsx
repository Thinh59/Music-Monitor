"use client";

import { type ReactNode, type ComponentType } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  Icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  Icon,
  children,
  action,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-border bg-bg-card overflow-hidden shadow-card ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-aurora opacity-60" />
      <div className="px-5 pt-5 pb-2 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {Icon && (
            <div className="h-9 w-9 rounded-lg bg-gradient-card border border-accent-purple/20 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-accent-purple" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            {subtitle && (
              <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5 pt-3">{children}</div>
    </div>
  );
}
