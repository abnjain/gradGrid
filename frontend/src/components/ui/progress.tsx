import React from "react";
import { cn } from "@/lib/utils";

/* ─── Progress Bar ─── */
export interface ProgressBarProps {
  value: number;           // 0–100
  size?: "sm" | "md" | "lg";
  color?: "brand" | "success" | "warning" | "danger" | "info";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const progressSizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const progressColors = {
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-accent",
  danger: "bg-danger",
  info: "bg-info",
};

function ProgressBar({
  value,
  size = "md",
  color = "brand",
  showLabel,
  label,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-charcoal font-medium">{label}</span>}
          {showLabel && <span className="text-xs text-mid font-medium">{clamped}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-surface-raised rounded-full overflow-hidden", progressSizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", progressColors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Step Progress ─── */
export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface StepProgressProps {
  steps: Step[];
  currentStep: number;  // 0-indexed
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function StepProgress({
  steps,
  currentStep,
  orientation = "horizontal",
  className,
}: StepProgressProps) {
  return (
    <div
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row items-start" : "flex-col",
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div
            key={step.id}
            className={cn(
              "flex",
              orientation === "horizontal" ? "flex-1 flex-col items-center" : "flex-row items-start gap-3"
            )}
          >
            {/* Step indicator */}
            <div className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-display border-2 transition-all duration-200",
                  isCompleted &&
                    "bg-brand border-brand text-white",
                  isActive &&
                    "border-brand bg-brand-dim text-brand",
                  !isCompleted &&
                    !isActive &&
                    "border-border-strong bg-surface text-mid"
                )}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
            </div>

            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  orientation === "horizontal"
                    ? "flex-1 h-[1.5px] mt-4 mx-2"
                    : "w-[1.5px] h-8 ml-4",
                  isCompleted ? "bg-brand" : "bg-border-strong"
                )}
              />
            )}

            {/* Label */}
            <div
              className={cn(
                orientation === "horizontal" ? "text-center mt-1.5" : "flex-1 pt-0.5",
                orientation === "horizontal" && index === steps.length - 1 && "pr-0",
                orientation === "horizontal" && !isActive && !isCompleted && "opacity-0 pointer-events-none"
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold",
                  isActive && "text-brand",
                  isCompleted && "text-success",
                  !isActive && !isCompleted && "text-mid"
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-[10px] text-mid mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ProgressBar, StepProgress };
