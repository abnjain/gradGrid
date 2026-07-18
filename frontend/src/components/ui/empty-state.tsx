import React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "./button";

/* ─── Empty State ─── */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mb-4">
        {icon || <Inbox className="w-7 h-7 text-mist" />}
      </div>
      <h3 className="text-[17px] font-bold font-display text-ink mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-mid max-w-[320px] leading-[1.6] mb-5">{description}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

/* ─── Coming Soon ─── */
export interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

function ComingSoon({
  title = "Coming Soon",
  description = "This feature is currently in development.",
  icon,
  className,
}: ComingSoonProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        className
      )}
    >
      <div className="w-[72px] h-[72px] rounded-2xl bg-accent-dim border border-accent-mid flex items-center justify-center mb-5">
        <span className="text-2xl">{icon || "🚧"}</span>
      </div>
      <h3 className="text-xl font-bold font-display text-ink mb-2">{title}</h3>
      <p className="text-sm text-mid max-w-sm leading-[1.6]">{description}</p>
    </div>
  );
}

export { EmptyState, ComingSoon };
