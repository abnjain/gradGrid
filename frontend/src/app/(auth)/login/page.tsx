"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, type InputHandle } from "@/components/ui/input";
import { AuthApiError, useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { resolvePostAuthRedirect } from "@/lib/auth-routes";
import { Lock, Eye, EyeOff, ArrowRight, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", password: "" });

  const emailRef = React.useRef<InputHandle>(null);
  const passwordRef = React.useRef<InputHandle>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = [emailRef, passwordRef].map((r) => r.current?.validate() ?? true).every(Boolean);
    if (!valid) return;

    setIsLoading(true);
    try {
      const userType = await login({ email: form.email.trim(), password: form.password });
      const returnUrl = searchParams.get("returnUrl");
      router.push(resolvePostAuthRedirect(userType, returnUrl));
      addToast({ variant: "success", title: "Signed in successfully" });
    } catch (err) {
      if (err instanceof AuthApiError) {
        if (err.code === "APPLICATION_PENDING") {
          addToast({
            variant: "warning",
            title: "Application pending",
            description: "Your signup is awaiting admin approval. You'll receive an email when approved.",
          });
        } else if (err.code === "APPLICATION_REJECTED") {
          addToast({
            variant: "error",
            title: "Application rejected",
            description: "Your previous application was rejected. You may submit a new one.",
          });
        } else if (err.code === "EMAIL_NOT_VERIFIED") {
          addToast({
            variant: "warning",
            title: "Email not verified",
            description: "Please complete email verification on the signup page.",
          });
          router.push(`/signup?step=verify&email=${encodeURIComponent(form.email.trim())}`);
        } else {
          addToast({ variant: "error", title: "Login failed", description: err.message });
        }
      } else {
        addToast({ variant: "error", title: "Login failed", description: "Invalid email or password" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-fog flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2.5 mb-8 no-underline">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-xl text-ink tracking-tight">GradGrid</span>
          </Link>

          <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Welcome back</h1>
          <p className="text-sm text-mid mb-8">Sign in to your institution or platform account</p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input ref={emailRef} label="Email" type="email" placeholder="you@institution.edu" autoComplete="email" required validation="email" requiredMessage="Email is required" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} iconLeft={<Mail className="w-4 h-4" />} />
            <div className="flex flex-col gap-1">
              <Input ref={passwordRef} label="Password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required validation="required" requiredMessage="Password is required" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} iconLeft={<Lock className="w-4 h-4" />} iconRight={<button type="button" aria-label="Toggle password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
              <div className="flex justify-end mt-0.5">
                <Link href="/forgot-password" className="text-xs text-brand hover:underline no-underline">Forgot password?</Link>
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full mt-2" loading={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-sm text-mid text-center mt-6">
            New to GradGrid?{" "}
            <Link href="/signup" className="text-brand hover:underline font-medium no-underline">Register your institution</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand to-brand-hover items-center justify-center">
        <div className="relative z-10 text-center px-12 max-w-md text-white">
          <h2 className="text-2xl font-bold font-display mb-3">All-in-One Education Platform</h2>
          <p className="text-white/70 text-sm leading-relaxed">Manage students, teachers, attendance, examinations, finances, and more.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-fog flex items-center justify-center text-mid">Loading…</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
