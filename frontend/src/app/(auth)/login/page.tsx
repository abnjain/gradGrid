"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Lock, Eye, EyeOff, ArrowRight, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [errors, setErrors] = React.useState({ email: "", password: "" });

  function validate(): boolean {
    const next = { email: "", password: "" };
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Invalid email address";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return !next.email && !next.password;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      addToast({ variant: "success", title: "Signed in successfully" });
      router.push("/app");
    } catch (err: any) {
      const message = err?.error?.message || err?.message || "Invalid email or password";
      addToast({ variant: "error", title: "Login failed", description: message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-fog flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-xl text-ink tracking-tight">GradGrid</span>
          </div>

          <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Welcome back</h1>
          <p className="text-sm text-mid mb-8">Sign in to your institution account</p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="you@institution.edu"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              iconLeft={<Mail className="w-4 h-4" />}
            />
            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                iconLeft={<Lock className="w-4 h-4" />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="flex justify-end mt-0.5">
                <a href="/forgot-password" className="text-xs text-brand hover:underline no-underline">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-2" loading={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-xs text-mist text-center mt-8 leading-[1.6]">
            By signing in, you agree to the{" "}
            <a href="#" className="text-brand hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-brand hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Right — Illustration / Brand */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand to-brand-hover relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_60%)]" />
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="text-4xl">🎓</span>
          </div>
          <h2 className="text-white text-2xl font-bold font-display mb-3">
            All-in-One Education Platform
          </h2>
          <p className="text-white/70 text-sm leading-[1.7]">
            Manage students, teachers, attendance, examinations, finances, and more — all from a single dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
