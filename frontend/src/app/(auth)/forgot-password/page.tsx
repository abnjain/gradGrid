"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, ChevronRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = React.useState(false);

  return (
    <div className="min-h-screen bg-fog flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold font-display">G</span>
          </div>
          <span className="font-display font-bold text-xl text-ink tracking-tight">GradGrid</span>
        </div>

        {!emailSent ? (
          <>
            <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Reset password</h1>
            <p className="text-sm text-mid mb-8">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setEmailSent(true); }}>
              <Input
                label="Email"
                type="email"
                placeholder="you@institution.edu"
                required
                iconLeft={<Mail className="w-4 h-4" />}
              />
              <Button type="submit" size="lg" className="w-full mt-2">
                Send Reset Link
                <ChevronRight className="w-4 h-4" />
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
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setEmailSent(false)}>
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Button>
          </>
        )}

        <div className="text-center mt-8">
          <a href="/login" className="text-sm text-brand hover:underline no-underline">
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
