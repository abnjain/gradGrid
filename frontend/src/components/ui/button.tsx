"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-body text-sm font-medium leading-none whitespace-nowrap rounded-md border border-transparent transition-all duration-[0.14s] relative select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:not-disabled:translate-y-[1px]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-white border-brand hover:bg-brand-hover hover:border-brand-hover hover:shadow-[0_0_0_3px_rgba(13,148,136,0.18)]",
        secondary:
          "bg-surface text-charcoal border-border-strong hover:bg-fog hover:border-mid",
        ghost:
          "bg-transparent text-charcoal border-transparent hover:bg-surface-raised",
        danger:
          "bg-danger text-white border-danger hover:bg-[#B91C1C] hover:border-[#B91C1C] hover:shadow-[0_0_0_3px_rgba(220,38,38,0.18)]",
        "danger-outline":
          "bg-transparent text-danger border-danger-mid hover:bg-danger-dim",
        warning:
          "bg-accent text-white border-accent hover:bg-accent-hover hover:border-accent-hover",
        success:
          "bg-success text-white border-success hover:bg-emerald-700 hover:border-emerald-700",
        link: "bg-transparent text-brand border-transparent p-0 h-auto text-sm hover:underline",
      },
      size: {
        xs: "h-[26px] px-2 text-xs rounded-sm gap-1",
        sm: "h-[30px] px-3 text-xs rounded-sm",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-md rounded-lg",
        xl: "h-[52px] px-8 text-lg rounded-lg font-display font-semibold",
        icon: "w-9 h-9 p-0",
        "icon-sm": "w-[30px] h-[30px] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  iconOnly?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "text-transparent pointer-events-none",
          disabled && "opacity-[0.42] cursor-not-allowed pointer-events-none"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              "absolute w-3.5 h-3.5 animate-spin",
              variant === "primary" || variant === "danger" || variant === "success" || variant === "warning"
                ? "text-white"
                : "text-charcoal"
            )}
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
