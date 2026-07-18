import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

const cardVariants = cva(
  "bg-surface border border-border rounded-lg transition-all duration-[0.14s]",
  {
    variants: {
      variant: {
        default: "",
        "stat": "p-5 hover:shadow-sm overflow-hidden relative",
        "detail": "p-6",
        "action": "p-6 cursor-pointer hover:border-brand-mid hover:shadow-[0_0_0_2px_rgba(13,148,136,0.08)]",
        "empty": "p-12 flex flex-col items-center justify-center min-h-[200px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; direction: "up" | "down"; label?: string };
  color?: "brand" | "amber" | "danger" | "success" | "info" | "violet";
  className?: string;
}

const colorAccents = {
  brand: { bg: "bg-brand-dim", icon: "text-brand" },
  amber: { bg: "bg-accent-dim", icon: "text-accent" },
  danger: { bg: "bg-danger-dim", icon: "text-danger" },
  success: { bg: "bg-success-dim", icon: "text-success" },
  info: { bg: "bg-info-dim", icon: "text-info" },
  violet: { bg: "bg-sensitive-dim", icon: "text-sensitive" },
};

function StatCard({ title, value, icon, trend, color = "brand", className }: StatCardProps) {
  const accent = colorAccents[color];

  return (
    <div className={cn(cardVariants({ variant: "stat" }), "flex flex-col gap-2.5", className)}>
      {/* Left rail accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand hidden" />

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-mid font-medium uppercase tracking-wide">{title}</span>
          <span className="text-[28px] font-bold font-display text-ink leading-tight">{value}</span>
        </div>
        {icon && (
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", accent.bg)}>
            <span className={cn("w-4.5 h-4.5", accent.icon)}>{icon}</span>
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend.direction === "up" ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-danger" />
          )}
          <span className={cn("font-semibold", trend.direction === "up" ? "text-success" : "text-danger")}>
            {trend.direction === "up" ? "+" : ""}{trend.value}%
          </span>
          {trend.label && <span className="text-mid">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: "div" | "section" | "article";
}

function Card({ className, variant = "default", as: Component = "div", ...props }: CardProps) {
  return <Component className={cn(cardVariants({ variant }), className)} {...props} />;
}

export interface DetailCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  divider?: boolean;
}

function DetailCard({ title, subtitle, headerRight, divider = true, children, className, ...props }: DetailCardProps) {
  return (
    <div className={cn(cardVariants({ variant: "detail" }), className)} {...props}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold font-display text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-mid mt-0.5">{subtitle}</p>}
        </div>
        {headerRight && <div className="flex items-center gap-2 flex-shrink-0">{headerRight}</div>}
      </div>
      {divider && <hr className="border-t border-border -mx-6 mb-4" />}
      <div>{children}</div>
    </div>
  );
}

export { Card, cardVariants, StatCard, DetailCard };
