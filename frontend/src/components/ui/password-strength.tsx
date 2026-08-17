"use client";

import React from "react";
import { Check } from "lucide-react";
import { checkPasswordStrength } from "@/lib/validators";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  /** The current password value — the checklist updates live as it changes. */
  value: string;
  /** Show the panel (e.g. while the password field is focused/clicked). */
  show?: boolean;
  className?: string;
}

/**
 * Live password strength indicator.
 * - Appears only when `show` is true (typically while the password field is focused)
 * - Strength bar with a label (Weak / Good / Strong)
 * - Required rules aligned inline, each with a filled check when satisfied
 */
export function PasswordStrength({ value, show = false, className }: PasswordStrengthProps) {
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

  if (!show) return null;

  return (
    <div className={cn("bg-fog border border-border rounded-lg px-3 py-2.5 space-y-2", className)}>
      {/* Strength bar */}
      {value.length > 0 && (
        <div className="flex items-center gap-2">
          <ProgressBar value={ratio * 100} size="sm" color={barColor} className="flex-1" />
          <span className={cn("text-xs font-semibold w-16 text-right", labelClass)}>{label}</span>
        </div>
      )}

      {/* Rules checklist — aligned inline, wrapping to fill the available width */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {rules.map((rule) => (
          <li key={rule.key} className="flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200",
                rule.met
                  ? "bg-success text-white"
                  : "bg-surface-raised text-transparent border border-border-strong"
              )}
              aria-hidden="true"
            >
              <Check className="w-2.5 h-2.5" strokeWidth={3} />
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
