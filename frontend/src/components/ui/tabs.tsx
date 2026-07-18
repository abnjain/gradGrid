"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ─── Tabs ─── */
export interface TabsProps {
  tabs: { id: string; label: string; count?: number; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills";
  className?: string;
}

function Tabs({ tabs, activeTab, onChange, variant = "underline", className }: TabsProps) {
  return (
    <div className={cn("flex", variant === "underline" ? "border-b border-border" : "gap-1", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap transition-all duration-[0.14s] font-body",
              "text-sm font-medium",
              variant === "underline" &&
                "px-4 py-2.5 border-b-2 -mb-[1px] text-mid hover:text-charcoal",
              variant === "underline" && isActive && "border-brand text-brand font-semibold",
              variant === "underline" && !isActive && "border-transparent",
              variant === "pills" &&
                "px-3 py-1.5 rounded-md text-mid hover:text-charcoal hover:bg-surface-raised",
              variant === "pills" && isActive && "bg-brand text-white hover:bg-brand-hover",
              "focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            )}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[10px] font-bold px-[5px] py-[1px] rounded-full leading-[1.4]",
                  variant === "underline" && isActive && "bg-brand-dim text-brand-text",
                  variant === "underline" && !isActive && "bg-surface-raised text-mid",
                  variant === "pills" && isActive && "bg-white/20 text-white",
                  variant === "pills" && !isActive && "bg-surface-raised text-mid"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Tab Content ─── */
export interface TabContentProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

function TabContent({ id, activeTab, children, className }: TabContentProps) {
  if (id !== activeTab) return null;
  return <div className={cn("pt-4", className)}>{children}</div>;
}

export { Tabs, TabContent };
