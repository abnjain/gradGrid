"use client";

import React from "react";
import { Check } from "lucide-react";
import { checkPasswordStrength } from "@/lib/validators";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  /** The current password value — the checklist updates live as it changes. */
  value: string;
  className?: string;
}

/**
 * Live password strength indicator.
 * - Shows a strength bar with a label (Weak / Good / Strong)
 * - Shows every required rule with a filled check when satisfied
 */
export function PasswordStrength({ value, className }: PasswordStrengthProps) {
  const rules = React.useMemo(() => checkPasswordStrength(value), [value]);
  const metCount = rules.filter((r) => r.met).length;
  const total = rules.length;
  const ratio = value.length === 0 ? 0 : metCount / total;

  let label = "Too weak";
  let barColor: "success" | "warning" | "danger" = "danger";
  if (ratio === 1) {
    label = "Strong";
    barColor = "success";
  } else if (ratio >= 0.6) {
    label = "Good";
    barColor = "warning";
  } else if (ratio > 0) {
    label = "Weak";
    barColor = "danger";
  }

  const labelClass =
    barColor === "success" ? "text-success" : barColor === "warning" ? "text-warning" : "text-danger";

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength bar */}
      {value.length > 0 && (
        <div className="flex items-center gap-2">
          <ProgressBar value={ratio * 100} size="sm" color={barColor} className="flex-1" />
          <span className={cn("text-xs font-semibold w-16 text-right", labelClass)}>{label}</span>
        </div>
      )}

      {/* Rules checklist */}
      <ul className="space-y-1 flex flex-col gap-x-4 gap-y-1 justify-around">
        {rules.map((rule) => (
          <li key={rule.key} className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200",
                rule.met
                  ? "bg-success text-white"
                  : "bg-surface-raised text-transparent border border-border-strong"
              )}
              aria-hidden="true"
            >
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
            <span
              className={cn(
                "transition-colors duration-200",
                rule.met ? "text-success font-medium" : "text-mid"
              )}
            >
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
