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

function PlatformLoginForm() {
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
      const userType = await login({ email: form.email.trim(), password: form.password }, "platform");
      const returnUrl = searchParams.get("returnUrl");
      router.push(resolvePostAuthRedirect(userType, returnUrl, true));
      addToast({ variant: "success", title: "Signed in successfully" });
    } catch (err) {
      if (err instanceof AuthApiError) {
        addToast({ variant: "error", title: "Login failed", description: err.message });
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
          <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Platform sign in</h1>
          <p className="text-sm text-mid mb-8">GradGrid platform operators only</p>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              ref={emailRef}
              label="Email"
              type="email"
              placeholder="admin@gradgrid.app"
              autoComplete="email"
              required
              validation="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              iconLeft={<Mail className="w-4 h-4" />}
            />
            <Input
              ref={passwordRef}
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              validation="required"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              iconLeft={<Lock className="w-4 h-4" />}
              iconRight={
                <button type="button" aria-label="Toggle password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <div className="flex justify-end">
              <Link href="/platform/forgot-password" className="text-xs text-brand hover:underline no-underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" size="lg" className="w-full mt-2" loading={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
          <p className="text-sm text-mid text-center mt-6">
            Institution staff?{" "}
            <Link href="/login" className="text-brand font-medium no-underline hover:underline">
              Staff login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PlatformLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-fog" />}>
      <PlatformLoginForm />
    </React.Suspense>
  );
}
