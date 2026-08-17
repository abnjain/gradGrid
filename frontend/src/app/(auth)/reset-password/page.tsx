"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, type InputHandle } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { api, type ApiResponse } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { Lock, Eye, EyeOff, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ password: "", confirmPassword: "" });

  const passwordRef = React.useRef<InputHandle>(null);
  const confirmPasswordRef = React.useRef<InputHandle>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fields = [passwordRef, confirmPasswordRef];
    const valid = fields.map((r) => r.current?.validate() ?? true).every(Boolean);
    if (!valid) return;

    setIsLoading(true);
    try {
      await api.post(
        "/auth/reset-password",
        { token, password: form.password },
        false // public endpoint — no auth required
      );
      setSubmitted(true);
      addToast({
        variant: "success",
        title: "Password reset",
        description: "Please sign in with your new password.",
      });
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      const apiError = err as Partial<ApiResponse>;
      const message = apiError?.error?.message || "Something went wrong. Please try again.";
      addToast({ variant: "error", title: "Reset failed", description: message });
    } finally {
      setIsLoading(false);
    }
  }

  // No token in the URL — show an invalid link state.
  if (!token) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 no-underline hover:no-underline">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-xl text-ink tracking-tight">GradGrid</span>
          </Link>
          <div className="w-16 h-16 rounded-full bg-danger-dim flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-danger" />
          </div>
          <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Invalid reset link</h1>
          <p className="text-sm text-mid text-center leading-[1.6] mb-8">
            This password reset link is missing or invalid. Please request a new one from the forgot
            password page.
          </p>
          <Link href="/forgot-password" className="block">
            <Button size="lg" className="w-full">
              Request a new link
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="text-center mt-8">
            <a href="/login" className="text-sm text-brand hover:underline no-underline">
              ← Back to sign in
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state after the API call.
  if (submitted) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 no-underline hover:no-underline">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-xl text-ink tracking-tight">GradGrid</span>
          </Link>
          <div className="w-16 h-16 rounded-full bg-success-dim flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-success" />
          </div>
          <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Password updated</h1>
          <p className="text-sm text-mid text-center leading-[1.6] mb-8">
            Your password has been reset successfully. You&apos;ll be redirected to sign in.
          </p>
          <Link href="/login" className="block">
            <Button size="lg" className="w-full">
              Go to sign in
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fog flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 no-underline hover:no-underline">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold font-display">G</span>
          </div>
          <span className="font-display font-bold text-xl text-ink tracking-tight">GradGrid</span>
        </Link>

        <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Set a new password</h1>
        <p className="text-sm text-mid mb-8">
          Choose a strong password for your GradGrid account.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <Input
              ref={passwordRef}
              label="New password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              required
              validation="password"
              requiredMessage="Valid Password is required"
              value={form.password}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              iconLeft={<Lock className="w-4 h-4" />}
              iconRight={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <PasswordStrength value={form.password} show={passwordFocused} />
          </div>
          <Input
            ref={confirmPasswordRef}
            label="Confirm new password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            required
            validation="password"
            validateMatch={form.password}
            requiredMessage="Confirm password is required"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            iconLeft={<Lock className="w-4 h-4" />}
            iconRight={
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Button type="submit" size="lg" className="w-full mt-2" loading={isLoading}>
            {isLoading ? "Resetting…" : "Reset Password"}
          </Button>
        </form>

        <div className="text-center mt-8">
          <a href="/login" className="text-sm text-brand hover:underline no-underline">
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
