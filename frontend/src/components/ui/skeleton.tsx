import React from "react";
import { cn } from "@/lib/utils";

/* ─── Skeleton ─── */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

function Skeleton({ className, variant = "text", width, height, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-surface-raised via-mist/20 to-surface-raised animate-shimmer rounded-sm",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 w-full rounded",
        variant === "rectangular" && "rounded-md",
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

/* ─── Skeleton Table (for loading states) ─── */
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn("bg-surface border border-border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-fog border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 px-4 py-3 border-b border-border last:border-b-0">
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonTable };
