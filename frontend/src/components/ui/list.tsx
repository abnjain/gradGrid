import React from "react";
import { cn } from "@/lib/utils";

/* ─── List ─── */
export interface ListItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface ListProps {
  items: ListItem[];
  variant?: "default" | "compact" | "card";
  className?: string;
  divider?: boolean;
}

function List({ items, variant = "default", className, divider = true }: ListProps) {
  const isCard = variant === "card";

  return (
    <div
      className={cn(
        isCard ? "bg-surface border border-border rounded-lg overflow-hidden" : "flex flex-col",
        className
      )}
    >
      {items.map((item, i) => {
        const content = (
          <div
            className={cn(
              "flex items-center gap-3 min-w-0",
              variant === "compact" ? "py-1.5" : "py-2.5",
              variant === "card" && "px-4",
              item.onClick && "cursor-pointer hover:bg-fog/60 transition-colors"
            )}
          >
            {item.icon && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-mid">
                <span className="w-4 h-4">{item.icon}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium text-ink truncate", variant === "compact" && "text-xs")}>
                {item.label}
              </p>
              {item.subtitle && (
                <p className="text-xs text-mid truncate mt-0.5">{item.subtitle}</p>
              )}
            </div>
            {item.right && <div className="flex-shrink-0">{item.right}</div>}
          </div>
        );

        return (
          <div key={item.id}>
            {item.href ? (
              <a href={item.href} className="block no-underline">
                {content}
              </a>
            ) : item.onClick ? (
              <button onClick={item.onClick} className="w-full text-left block">
                {content}
              </button>
            ) : (
              content
            )}
            {divider && i < items.length - 1 && (
              <hr className={cn("border-t border-border", variant === "card" ? "mx-4" : "")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { List };
