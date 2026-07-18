import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full leading-5 whitespace-nowrap font-body",
  {
    variants: {
      variant: {
        // Status badges
        "status-active": "bg-success-dim text-success-text border border-success-mid",
        "status-inactive": "bg-fog text-mid border border-border-strong",
        "status-pending": "bg-accent-dim text-accent-text border border-accent-mid",
        "status-danger": "bg-danger-dim text-danger-text border border-danger-mid",
        "status-info": "bg-info-dim text-info-text border border-info-mid",
        "status-sensitive": "bg-sensitive-dim text-sensitive-text border border-sensitive-mid",
        // Category badges
        category: "bg-surface border border-border-strong text-charcoal font-medium",
        "category-teal": "bg-brand-dim border-brand-mid text-brand-text",
        "category-amber": "bg-accent-dim border-accent-mid text-accent-text",
        "category-violet": "bg-sensitive-dim border-sensitive-mid text-sensitive-text",
        // Count badges
        count: "bg-brand text-white rounded-full text-[10px] font-bold min-w-[18px] h-[18px] inline-flex items-center justify-center px-1 leading-none",
        "count-danger": "bg-danger text-white rounded-full text-[10px] font-bold min-w-[18px] h-[18px] inline-flex items-center justify-center px-1 leading-none",
        "count-muted": "bg-surface-raised text-mid border border-border rounded-full text-[10px] font-bold min-w-[18px] h-[18px] inline-flex items-center justify-center px-1 leading-none",
        // Priority badges
        "priority-high": "bg-danger-dim text-danger-text text-[10px] font-bold uppercase tracking-wide px-[7px] py-[1px] rounded-xs",
        "priority-medium": "bg-accent-dim text-accent-text text-[10px] font-bold uppercase tracking-wide px-[7px] py-[1px] rounded-xs",
        "priority-low": "bg-info-dim text-info-text text-[10px] font-bold uppercase tracking-wide px-[7px] py-[1px] rounded-xs",
        // Role badges
        role: "bg-surface-raised text-charcoal border border-border-strong text-[10px] font-semibold tracking-wide px-2 py-[2px] rounded-sm",
        "role-owner": "bg-orange-50 border-amber-200 text-orange-800",
        "role-admin": "bg-brand-dim border-brand-mid text-brand-text",
        "role-teacher": "bg-info-dim border-info-mid text-info-text",
        "role-accountant": "bg-success-dim border-success-mid text-success-text",
        "role-hr": "bg-sensitive-dim border-sensitive-mid text-sensitive-text",
        "role-receptionist": "bg-accent-dim border-accent-mid text-accent-text",
        // Coming soon
        "coming-soon": "bg-accent-dim text-accent-text text-[10px] px-1.5 py-[1px] rounded-full font-bold uppercase tracking-wide border border-accent-mid",
      },
    },
    defaultVariants: {
      variant: "status-active",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
