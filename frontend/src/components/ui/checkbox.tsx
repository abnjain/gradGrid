"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

/* ─── Checkbox ─── */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  indeterminate?: boolean;
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, label, id, disabled, ...props }, ref) => {
    const inputId = id || `cb-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label htmlFor={inputId} className={cn("inline-flex items-center gap-2 cursor-pointer group", disabled && "cursor-not-allowed opacity-50")}>
        <div className="relative flex-shrink-0">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 rounded-[3px] border-[1.5px] border-border-strong bg-surface transition-all duration-[0.14s]",
              "group-hover:not-disabled:border-mid",
              "peer-checked:bg-brand peer-checked:border-brand",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2",
              indeterminate && "bg-brand border-brand"
            )}
          >
            {indeterminate ? (
              <Minus className="w-full h-full text-white p-[2px]" />
            ) : (
              <Check className="w-full h-full text-white p-[2px] opacity-0 peer-checked:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
        {label && <span className="text-sm text-charcoal select-none">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

/* ─── Radio ─── */
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const inputId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label htmlFor={inputId} className={cn("inline-flex items-center gap-2 cursor-pointer group", disabled && "cursor-not-allowed opacity-50")}>
        <div className="relative flex-shrink-0">
          <input
            id={inputId}
            ref={ref}
            type="radio"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-4 h-4 rounded-full border-[1.5px] border-border-strong bg-surface transition-all duration-[0.14s]",
              "group-hover:not-disabled:border-mid",
              "peer-checked:border-brand peer-checked:bg-white",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2"
            )}
          >
            <div className="w-full h-full rounded-full bg-brand scale-0 peer-checked:scale-[0.55] transition-transform duration-[0.14s]" />
          </div>
        </div>
        {label && <span className="text-sm text-charcoal select-none">{label}</span>}
      </label>
    );
  }
);
Radio.displayName = "Radio";

/* ─── Toggle ─── */
export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, id, disabled, ...props }, ref) => {
    const inputId = id || `toggle-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label htmlFor={inputId} className={cn("inline-flex items-start gap-3 cursor-pointer group", disabled && "cursor-not-allowed opacity-50")}>
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-[38px] h-5 rounded-full border-[1.5px] border-border-strong bg-surface-raised transition-all duration-[0.2s] relative",
              "peer-checked:bg-brand peer-checked:border-brand",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-brand peer-focus-visible:outline-offset-2"
            )}
          >
            <div
              className={cn(
                "w-3.5 h-3.5 rounded-full bg-white shadow-xs absolute top-[1.5px] left-[1.5px] transition-all duration-[0.2s]",
                "peer-checked:translate-x-[18px]"
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-charcoal select-none">{label}</span>}
            {description && <span className="text-xs text-mid mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);
Toggle.displayName = "Toggle";

export { Checkbox, Radio, Toggle };
