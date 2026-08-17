"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, type InputHandle } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { api, type ApiResponse } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { Lock, Eye, EyeOff, ArrowRight, Mail, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Refs to Input handles — validation lives inside the Input component.
  const firstNameRef = React.useRef<InputHandle>(null);
  const lastNameRef = React.useRef<InputHandle>(null);
  const emailRef = React.useRef<InputHandle>(null);
  const passwordRef = React.useRef<InputHandle>(null);
  const confirmPasswordRef = React.useRef<InputHandle>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Trigger the built-in validation on every field.
    const fields = [firstNameRef, lastNameRef, emailRef, passwordRef, confirmPasswordRef];
    const valid = fields.map((r) => r.current?.validate() ?? true).every(Boolean);
    if (!valid) return;

    setIsLoading(true);
    try {
      await api.post(
        "/auth/register",
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
        },
        false
      );
      addToast({ variant: "success", title: "Account created", description: "Please sign in with your new credentials." });
      router.push("/login");
    } catch (err) {
      const apiError = err as Partial<ApiResponse>;
      const message = apiError?.error?.message || "Something went wrong. Please try again.";
      addToast({ variant: "error", title: "Sign up failed", description: message });
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
          <Link href="/" className="flex items-center gap-2.5 mb-8 no-underline hover:no-underline">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-xl text-ink tracking-tight">GradGrid</span>
          </Link>

          <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Create your account</h1>
          <p className="text-sm text-mid mb-8">Start your institution&rsquo;s journey with GradGrid</p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                ref={firstNameRef}
                label="First name"
                placeholder="Jane"
                required
                validation="name"
                requiredMessage="First name is required"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                iconLeft={<User className="w-4 h-4" />}
              />
              <Input
                ref={lastNameRef}
                label="Last name"
                placeholder="Doe"
                required
                validation="name"
                requiredMessage="Last name is required"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                iconLeft={<User className="w-4 h-4" />}
              />
            </div>
            <Input
              ref={emailRef}
              label="Email"
              type="email"
              placeholder="you@institution.edu"
              required
              validation="email"
              requiredMessage="Email is required"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              iconLeft={<Mail className="w-4 h-4" />}
            />
            <Input
              ref={passwordRef}
              label="Password"
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
            <Input
              ref={confirmPasswordRef}
              label="Confirm password"
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
              {isLoading ? "Creating account…" : "Create Account"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-sm text-mist text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <p className="text-xs text-mist text-center mt-8 leading-[1.6]">
            By creating an account, you agree to the{" "}
            <Link href="/terms" className="text-brand hover:underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
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
          <p className="text-white/80 text-sm leading-relaxed">
            Manage students, attendance, examinations, and fees — all from one simple, secure
            platform designed for schools, colleges, and educational organizations.
          </p>
        </div>
      </div>
    </div>
  );
}
