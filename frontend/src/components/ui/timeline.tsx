import React from "react";
import { cn } from "@/lib/utils";

/* ─── Timeline ─── */
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  icon?: React.ReactNode;
  color?: "brand" | "amber" | "danger" | "success" | "info" | "violet" | "mist";
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const timelineColors = {
  brand: "border-brand-mid bg-brand-dim",
  amber: "border-accent-mid bg-accent-dim",
  danger: "border-danger-mid bg-danger-dim",
  success: "border-success-mid bg-success-dim",
  info: "border-info-mid bg-info-dim",
  violet: "border-sensitive-mid bg-sensitive-dim",
  mist: "border-border-strong bg-surface-raised",
};

function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const color = timelineColors[item.color || "brand"];

        return (
          <div key={item.id} className="flex gap-3 relative">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[11px] top-[28px] bottom-0 w-[1.5px] bg-border-strong" />
            )}

            {/* Dot */}
            <div className="flex-shrink-0 relative z-10 pt-1">
              {item.icon ? (
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2", color)}>
                  <span className="w-3 h-3">{item.icon}</span>
                </div>
              ) : (
                <div className={cn("w-[23px] h-[23px] rounded-full border-[2.5px]", color)} />
              )}
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                {item.timestamp && (
                  <span className="text-[11px] text-mist whitespace-nowrap flex-shrink-0 mt-0.5">{item.timestamp}</span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-mid mt-0.5 leading-[1.6]">{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { Timeline };
