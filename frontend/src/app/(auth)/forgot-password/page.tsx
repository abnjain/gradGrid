"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, type InputHandle } from "@/components/ui/input";
import { api, type ApiResponse } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);
  const emailRef = React.useRef<InputHandle>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valid = emailRef.current?.validate() ?? true;
    if (!valid) return;

    setIsLoading(true);
    try {
      await api.post(
        "/auth/forgot-password",
        { email: email.trim() },
        false // public endpoint — no auth required
      );
      setEmailSent(true);
    } catch (err) {
      const apiError = err as Partial<ApiResponse>;
      const message = apiError?.error?.message || "Something went wrong. Please try again.";
      addToast({ variant: "error", title: "Request failed", description: message });
    } finally {
      setIsLoading(false);
    }
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

        {!emailSent ? (
          <>
            <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Reset password</h1>
            <p className="text-sm text-mid mb-8">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                ref={emailRef}
                label="Email"
                type="email"
                placeholder="you@institution.edu"
                required
                validation="email"
                requiredMessage="Email is required"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                iconLeft={<Mail className="w-4 h-4" />}
              />
              <Button type="submit" size="lg" className="w-full mt-2" loading={isLoading}>
                {isLoading ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-success-dim flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-success" />
            </div>
            <h1 className="text-[28px] font-bold font-display text-ink mb-1.5 text-center">Check your email</h1>
            <p className="text-sm text-mid text-center leading-[1.6] mb-8">
              We&apos;ve sent a password reset link to your email. Please check your inbox and follow the instructions.
            </p>
            <Link href="/login" className="block">
              <Button variant="secondary" size="lg" className="w-full">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
