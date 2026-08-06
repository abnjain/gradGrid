/**
 * GradGrid — Reusable Validators
 *
 * Named validation rules that can be used anywhere: passed to the `Input`
 * component via its `validation` prop, or called directly on raw values.
 *
 * Usage:
 *   <Input label="Email" validation="email" />
 *   <Input label="Confirm password" validation="password" validateMatch={form.password} />
 */

export type ValidatorName =
  | "required"
  | "name"
  | "email"
  | "password"
  | "phone"
  | "url";

export interface ValidateOptions {
  /** Value the input must match (e.g. confirm-password). */
  matchValue?: string;
  /** Override the default error message for the variant (format/rule errors). */
  customMessage?: string;
  /** Message shown when the field is empty (e.g. "Email is required"). */
  requiredMessage?: string;
  /** Whether an empty value is treated as invalid. Defaults to true. */
  required?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'\-.\s]{1,99}$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,20}$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;

export const DEFAULT_MESSAGES: Record<ValidatorName, string> = {
  required: "This field is required",
  name: "Please enter a valid name",
  email: "Please enter a valid email address",
  password:
    "Password must include at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character",
  phone: "Please enter a valid phone number",
  url: "Please enter a valid URL",
};

/* ─── Password strength ─── */

export interface PasswordRule {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { key: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { key: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "number", label: "One number", test: (v) => /\d/.test(v) },
  { key: "special", label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** Returns each rule with whether it is satisfied by the value. */
export function checkPasswordStrength(value: string) {
  return PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(value) }));
}

/** True when the value satisfies every password rule. */
export function isPasswordStrong(value: string) {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

/**
 * Validate a raw value against a named rule.
 * Returns an error message string, or undefined when valid.
 */
export function validateValue(
  value: string,
  validation?: ValidatorName,
  options?: ValidateOptions
): string | undefined {
  if (!validation) return undefined;

  const trimmed = value.trim();
  const isEmpty = trimmed.length === 0;
  const { matchValue, customMessage, requiredMessage, required = true } = options ?? {};
  const msg = customMessage || DEFAULT_MESSAGES[validation];
  // Field-aware required message takes priority for empty values.
  const requiredMsg = requiredMessage || customMessage || DEFAULT_MESSAGES.required;

  // Match check (confirm-password style) — takes precedence when value present.
  if (matchValue !== undefined && !isEmpty && value !== matchValue) {
    return customMessage || "Passwords do not match";
  }

  switch (validation) {
    case "required":
      return isEmpty ? requiredMsg : undefined;

    case "name":
      if (isEmpty) return required ? requiredMsg : undefined;
      return NAME_RE.test(trimmed) ? undefined : msg;

    case "email":
      if (isEmpty) return required ? requiredMsg : undefined;
      return EMAIL_RE.test(trimmed) ? undefined : msg;

    case "password":
      if (isEmpty) return required ? requiredMsg : undefined;
      return isPasswordStrong(value) ? undefined : msg;

    case "phone":
      if (isEmpty) return required ? requiredMsg : undefined;
      return PHONE_RE.test(trimmed) ? undefined : msg;

    case "url":
      if (isEmpty) return required ? requiredMsg : undefined;
      return URL_RE.test(trimmed) ? undefined : msg;

    default:
      return undefined;
  }
}

/** Convenience helpers for non-Input usage. */
export const validators = {
  required: (v: string) => validateValue(v, "required"),
  name: (v: string) => validateValue(v, "name"),
  email: (v: string) => validateValue(v, "email"),
  password: (v: string) => validateValue(v, "password"),
  phone: (v: string) => validateValue(v, "phone"),
  url: (v: string) => validateValue(v, "url"),
};
