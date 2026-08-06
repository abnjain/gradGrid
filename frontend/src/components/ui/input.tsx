"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { validateValue, type ValidatorName } from "@/lib/validators";

export interface InputHandle {
  /** Validate the current value against the named rule. Returns true when valid. */
  validate: () => boolean;
  /** Clear any internally shown validation error. */
  clearError: () => void;
  /** Focus the underlying input. */
  focus: () => void;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  status?: "default" | "error" | "success" | "loading";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  hint?: string;
  error?: string;
  successMsg?: string;
  label?: string;
  required?: boolean;
  containerClassName?: string;
  /** Named validation variant — runs on blur and via the ref handle. */
  validation?: ValidatorName;
  /** Value to match against (e.g. confirm-password matches the password field). */
  validateMatch?: string;
  /** Override the default message for the named validation variant. */
  validationMessage?: string;
  /** Message shown when the field is left empty (e.g. "Email is required"). */
  requiredMessage?: string;
  /** Treat empty value as invalid (default true). */
  validationRequired?: boolean;
}

const Input = React.forwardRef<InputHandle, InputProps>(
  (
    {
      className,
      status = "default",
      iconLeft,
      iconRight,
      hint,
      error,
      successMsg,
      label,
      required,
      containerClassName,
      validation,
      validateMatch,
      validationMessage,
      requiredMessage,
      validationRequired = true,
      id,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
    const inputId = id || `input-${generatedId}`;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [blurError, setBlurError] = React.useState<string | undefined>();

    const effectiveError = error ?? blurError;
    const effectiveStatus = effectiveError ? "error" : status;

    const computeError = React.useCallback(
      (currentValue: string): string | undefined =>
        validateValue(currentValue, validation, {
          matchValue: validateMatch,
          customMessage: validationMessage,
          requiredMessage,
          required: validationRequired,
        }),
      [validation, validateMatch, validationMessage, requiredMessage, validationRequired]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        validate: () => {
          const currentValue =
            typeof value === "string" ? value : inputRef.current?.value ?? "";
          const err = computeError(currentValue);
          setBlurError(err);
          return !err;
        },
        clearError: () => setBlurError(undefined),
        focus: () => inputRef.current?.focus(),
      }),
      [computeError, value]
    );

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (validation) setBlurError(computeError(e.target.value));
      onBlur?.(e);
    };

    return (
      <div className={cn("flex flex-col gap-1 relative", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="flex items-center gap-1 text-sm font-medium text-charcoal">
            {label}
            {required && <span className="text-danger text-sm">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {iconLeft && (
            <span className="absolute left-2.5 text-mist pointer-events-none flex items-center">{iconLeft}</span>
          )}
          <input
            id={inputId}
            ref={inputRef}
            onBlur={handleBlur}
            className={cn(
              "w-full h-[38px] px-3 text-sm text-ink bg-surface border-[1.5px] border-border-strong rounded-md outline-none transition-all duration-[0.14s] font-body placeholder:text-mist",
              "hover:not-disabled:not-[.input-error]:not-[.input-success]:border-mid",
              "focus:border-brand focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)]",
              effectiveStatus === "error" &&
                "border-danger bg-[#FFFBFB] dark:bg-danger-dim/20 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.10)]",
              effectiveStatus === "success" && "border-success focus:shadow-[0_0_0_3px_rgba(5,150,105,0.10)]",
              effectiveStatus === "loading" && "animate-shimmer",
              "disabled:bg-fog disabled:text-mid disabled:cursor-not-allowed disabled:border-border",
              iconLeft && "pl-9",
              iconRight && "pr-9",
              className
            )}
            disabled={props.disabled || effectiveStatus === "loading"}
            value={value}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-2.5 text-mist flex items-center cursor-pointer hover:text-charcoal transition-colors">
              {iconRight}
            </span>
          )}
        </div>
        {effectiveError && <span className="text-xs text-danger flex items-center gap-1 mt-0.5">{effectiveError}</span>}
        {successMsg && !effectiveError && <span className="text-xs text-success flex items-center gap-1 mt-0.5">{successMsg}</span>}
        {hint && !effectiveError && !successMsg && <span className="text-xs text-mist mt-0.5 leading-5">{hint}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, required, error, hint, options, placeholder, id, ...props }, ref) => {
    const generatedId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
    const selectId = id || `select-${generatedId}`;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="flex items-center gap-1 text-sm font-medium text-charcoal">
            {label}
            {required && <span className="text-danger text-sm">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full h-[38px] px-3 text-sm text-ink bg-surface border-[1.5px] border-border-strong rounded-md outline-none transition-all duration-[0.14s] font-body",
            "appearance-none pr-8 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_10px_center]",
            "hover:border-mid focus:border-brand focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)]",
            "cursor-pointer",
            error && "border-danger",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-danger">{error}</span>}
        {hint && <span className="text-xs text-mist">{hint}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, required, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
    const textareaId = id || `textarea-${generatedId}`;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="flex items-center gap-1 text-sm font-medium text-charcoal">
            {label}
            {required && <span className="text-danger text-sm">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full min-h-[88px] px-3 py-2 text-sm text-ink bg-surface border-[1.5px] border-border-strong rounded-md outline-none transition-all duration-[0.14s] font-body placeholder:text-mist resize-y leading-[1.6]",
            "hover:border-mid focus:border-brand focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)]",
            error && "border-danger",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {hint && <span className="text-xs text-mist">{hint}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Select, Textarea };
