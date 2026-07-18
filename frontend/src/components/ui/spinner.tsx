import React from "react";
import { cn } from "@/lib/utils";

/* ─── Spinner ─── */
export interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "brand" | "white" | "muted";
  className?: string;
}

const sizeMap = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const colorMap = {
  brand: "border-brand-mid border-t-brand",
  white: "border-white/25 border-t-white",
  muted: "border-border-strong border-t-mid",
};

function Spinner({ size = "md", color = "brand", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "border-[2.5px] rounded-full animate-spin",
        sizeMap[size],
        colorMap[color],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ─── Full Page Spinner ─── */
export interface PageSpinnerProps {
  label?: string;
  className?: string;
}

function PageSpinner({ label = "Loading...", className }: PageSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 gap-3", className)}>
      <Spinner size="lg" />
      <p className="text-sm text-mid font-medium">{label}</p>
    </div>
  );
}

export { Spinner, PageSpinner };
