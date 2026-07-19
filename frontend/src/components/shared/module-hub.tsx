"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ─── ModuleHub ───
   Displays a grid of feature cards for a module's sub-pages.
   Used by top-level module pages to replace bare ComingSoon stubs. */

export interface HubFeature {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
  comingSoon?: boolean;
  count?: number;
  color?: "brand" | "amber" | "success" | "danger" | "info" | "violet";
}

const colorMap = {
  brand: { bg: "bg-brand-dim", icon: "text-brand", border: "hover:border-brand-mid", shadow: "hover:shadow-[0_0_0_2px_rgba(13,148,136,0.08)]" },
  amber: { bg: "bg-accent-dim", icon: "text-accent", border: "hover:border-accent-mid", shadow: "hover:shadow-[0_0_0_2px_rgba(245,158,11,0.08)]" },
  success: { bg: "bg-success-dim", icon: "text-success", border: "hover:border-success-mid", shadow: "hover:shadow-[0_0_0_2px_rgba(5,150,105,0.08)]" },
  danger: { bg: "bg-danger-dim", icon: "text-danger", border: "hover:border-danger-mid", shadow: "hover:shadow-[0_0_0_2px_rgba(220,38,38,0.08)]" },
  info: { bg: "bg-info-dim", icon: "text-info", border: "hover:border-info-mid", shadow: "hover:shadow-[0_0_0_2px_rgba(2,132,199,0.08)]" },
  violet: { bg: "bg-sensitive-dim", icon: "text-sensitive", border: "hover:border-sensitive-mid", shadow: "hover:shadow-[0_0_0_2px_rgba(139,92,246,0.08)]" },
};

interface ModuleHubProps {
  title: string;
  description: string;
  features: HubFeature[];
}

function ModuleHub({ title, description, features }: ModuleHubProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-ink">{title}</h1>
        <p className="text-sm text-mid mt-0.5">{description}</p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => {
          const colors = colorMap[f.color ?? "brand"];
          const Icon = f.icon;
          return (
            <Link
              key={f.href}
              href={f.comingSoon ? "#" : f.href}
              className={cn(
                "group relative bg-surface border border-border rounded-xl p-5 transition-all no-underline",
                f.comingSoon ? "opacity-70 cursor-not-allowed" : colors.border + " " + colors.shadow
              )}
              onClick={f.comingSoon ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bg)}>
                  <Icon className={cn("w-5 h-5", colors.icon)} />
                </div>
                {f.comingSoon && (
                  <Badge variant="coming-soon">Soon</Badge>
                )}
                {f.count !== undefined && (
                  <Badge variant="count">{f.count}</Badge>
                )}
              </div>
              <h3 className="text-sm font-semibold text-ink mb-1">{f.title}</h3>
              <p className="text-xs text-mid leading-relaxed">{f.description}</p>
              {!f.comingSoon && (
                <ChevronRight className="w-4 h-4 text-mist absolute right-4 top-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export { ModuleHub };
