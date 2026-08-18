"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, type InputHandle } from "@/components/ui/input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useAuth, AuthApiError } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { warmApi } from "@/lib/warm-api";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";

type Step = "institution" | "owner" | "verify" | "pending";

function SignupWizard() {
  const searchParams = useSearchParams();
  const { registerInstitution, verifyEmail, resendOtp } = useAuth();
  const { addToast } = useToast();

  const initialStep = searchParams.get("step") === "verify" ? "verify" : "institution";
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = React.useState<Step>(initialStep);
  const [isLoading, setIsLoading] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState(initialEmail);
  const [otp, setOtp] = React.useState("");
  const [showDevOtp, setShowDevOtp] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);

  const [form, setForm] = React.useState({
    organizationName: "",
    institutionName: "",
    institutionCode: "",
    city: "",
    state: "",
    firstName: "",
    lastName: "",
    email: initialEmail,
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const orgRef = React.useRef<InputHandle>(null);
  const instNameRef = React.useRef<InputHandle>(null);
  const instCodeRef = React.useRef<InputHandle>(null);
  const firstNameRef = React.useRef<InputHandle>(null);
  const lastNameRef = React.useRef<InputHandle>(null);
  const emailRef = React.useRef<InputHandle>(null);
  const verifyEmailRef = React.useRef<InputHandle>(null);
  const phoneRef = React.useRef<InputHandle>(null);
  const passwordRef = React.useRef<InputHandle>(null);
  const confirmPasswordRef = React.useRef<InputHandle>(null);

  const [isWarming, setIsWarming] = React.useState(false);

  React.useEffect(() => {
    void warmApi();
  }, []);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function goToOwner() {
    const valid = [orgRef, instNameRef, instCodeRef]
      .map((r) => r.current?.validate() ?? true)
      .every(Boolean);
    if (!valid) return;
    setStep("owner");
  }

  async function submitApplication() {
    const valid = [firstNameRef, lastNameRef, emailRef, passwordRef, confirmPasswordRef]
      .map((r) => r.current?.validate() ?? true)
      .every(Boolean);
    if (phoneRef.current && form.phone) {
      if (!(phoneRef.current.validate())) return;
    }
    if (!valid) return;

    setIsLoading(true);
    try {
      setIsWarming(true);
      const ready = await warmApi(90_000);
      setIsWarming(false);
      if (!ready) {
        addToast({
          variant: "warning",
          title: "Server is starting",
          description: "Render free tier can take up to 60s on first request. Please try again in a moment.",
        });
        return;
      }

      const result = await registerInstitution({
        organizationName: form.organizationName.trim(),
        institutionName: form.institutionName.trim(),
        institutionCode: form.institutionCode.trim().toUpperCase(),
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      setSubmittedEmail(result.email);
      if (result.verificationOtp) {
        setOtp(result.verificationOtp);
        setShowDevOtp(true);
      }
      setStep("verify");
      addToast({
        variant: "success",
        title: "Application submitted",
        description: result.verificationOtp
          ? "Enter the verification code shown below."
          : "Check your email for a verification code.",
      });
    } catch (err) {
      const message = err instanceof AuthApiError ? err.message : "Sign up failed";
      if (err instanceof AuthApiError && err.code === "APPLICATION_PENDING") {
        setSubmittedEmail(form.email.trim());
        setStep("verify");
        addToast({
          variant: "warning",
          title: "Application already submitted",
          description: "Enter your verification code or resend a new one.",
        });
      } else if (err instanceof AuthApiError && err.code === "API_COLD_START") {
        addToast({
          variant: "warning",
          title: "Server is waking up",
          description: err.message,
        });
      } else {
        addToast({ variant: "error", title: "Sign up failed", description: message });
      }
    } finally {
      setIsWarming(false);
      setIsLoading(false);
    }
  }

  const emailChanged =
    submittedEmail.trim().length > 0 &&
    form.email.trim().toLowerCase() !== submittedEmail.trim().toLowerCase();

  const hasSignupPayload =
    Boolean(form.organizationName.trim()) &&
    Boolean(form.institutionName.trim()) &&
    Boolean(form.institutionCode.trim()) &&
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim()) &&
    Boolean(form.password);

  function handleVerifyEmailChange(value: string) {
    setForm((prev) => ({ ...prev, email: value }));
    if (submittedEmail && value.trim().toLowerCase() !== submittedEmail.trim().toLowerCase()) {
      setOtp("");
      setShowDevOtp(false);
    }
  }

  async function registerOrResendForEmail(email: string) {
    const changed =
      submittedEmail.trim().length > 0 &&
      email.trim().toLowerCase() !== submittedEmail.trim().toLowerCase();

    if (changed) {
      if (!hasSignupPayload) {
        addToast({
          variant: "error",
          title: "Cannot change email",
          description: "Start a new application to register with a different email address.",
        });
        return null;
      }
      const ready = await warmApi(90_000);
      if (!ready) {
        addToast({
          variant: "warning",
          title: "Server is starting",
          description: "Please wait a moment and try again.",
        });
        return null;
      }
      return registerInstitution({
        organizationName: form.organizationName.trim(),
        institutionName: form.institutionName.trim(),
        institutionCode: form.institutionCode.trim().toUpperCase(),
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email,
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
    }
    return resendOtp(email);
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!(verifyEmailRef.current?.validate() ?? true)) return;
    const email = form.email.trim();
    if (!/^\d{6}$/.test(otp)) {
      addToast({ variant: "error", title: "Invalid code", description: "Enter the 6-digit code from your email." });
      return;
    }
    if (emailChanged) {
      addToast({
        variant: "warning",
        title: "Email changed",
        description: hasSignupPayload
          ? "Resend the code to your new email address before verifying."
          : "Resend the code to this email, or start a new application with the updated address.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await verifyEmail(email, otp);
      setSubmittedEmail(email);
      setStep("pending");
      addToast({ variant: "success", title: "Email verified", description: "Your application is awaiting admin approval." });
    } catch (err) {
      const message = err instanceof AuthApiError ? err.message : "Verification failed";
      addToast({ variant: "error", title: "Verification failed", description: message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    if (!(verifyEmailRef.current?.validate() ?? true)) return;
    const email = form.email.trim();

    setIsLoading(true);
    try {
      const result = await registerOrResendForEmail(email);
      if (!result) return;

      setSubmittedEmail(email);
      if (result && "verificationOtp" in result && result.verificationOtp) {
        setOtp(result.verificationOtp);
        setShowDevOtp(true);
      }
      setResendCooldown(60);
      addToast({
        variant: "success",
        title: emailChanged ? "Code sent to new email" : "Code sent",
        description:
          result && "verificationOtp" in result && result.verificationOtp
            ? "A new code is shown below."
            : `A verification code has been sent to ${email}.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please try again later.";
      if (err instanceof AuthApiError && err.code === "APPLICATION_PENDING" && !emailChanged) {
        setSubmittedEmail(email);
        setResendCooldown(60);
        addToast({
          variant: "warning",
          title: "Application under review",
          description: "This email is already verified and awaiting admin approval.",
        });
        return;
      }
      addToast({
        variant: "error",
        title: "Could not send code",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-fog flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-8 no-underline hover:no-underline">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold font-display">G</span>
            </div>
            <span className="font-display font-bold text-xl text-ink tracking-tight">GradGrid</span>
          </Link>

          {step === "pending" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-brand" />
              </div>
              <h1 className="text-[28px] font-bold font-display text-ink mb-2">Application submitted</h1>
              <p className="text-sm text-mid mb-6 leading-relaxed">
                Your institution signup for <strong>{form.institutionName}</strong> is pending admin approval.
                You&apos;ll receive an email once your account is approved, then you can sign in.
              </p>
              <Link href="/login">
                <Button variant="secondary" className="w-full">Back to sign in</Button>
              </Link>
            </div>
          ) : step === "verify" ? (
            <>
              <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Verify your email</h1>
              <p className="text-sm text-mid mb-6">
                Enter your email and the 6-digit code we sent you.
              </p>
              <form className="flex flex-col gap-4" onSubmit={submitOtp}>
                <Input
                  ref={verifyEmailRef}
                  label="Email"
                  type="email"
                  placeholder="owner@school.edu"
                  required
                  validation="email"
                  requiredMessage="Email is required"
                  value={form.email}
                  onChange={(e) => handleVerifyEmailChange(e.target.value)}
                  iconLeft={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Verification code"
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  iconLeft={<Lock className="w-4 h-4" />}
                  required
                />
                {emailChanged && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 -mt-1">
                    {hasSignupPayload
                      ? "You changed your email. Resend the code to verify this address."
                      : "You changed your email. Resend the code, or start a new application if needed."}
                  </p>
                )}
                {showDevOtp && otp && !emailChanged && (
                  <div className="rounded-lg border border-accent-mid bg-accent-dim px-4 py-3 text-sm text-accent-text -mt-1">
                    Email is not configured on this server. Your verification code is:{" "}
                    <strong className="font-mono text-base tracking-widest">{otp}</strong>
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full" loading={isLoading} disabled={emailChanged}>
                  Verify email
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleResendOtp}
                  className="text-sm text-brand hover:underline disabled:text-mist disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : emailChanged ? "Send code to this email" : "Resend code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-[28px] font-bold font-display text-ink mb-1.5">Register your institution</h1>
              <p className="text-sm text-mid mb-6">
                {step === "institution"
                  ? "Step 1 of 2 — Tell us about your organization"
                  : "Step 2 of 2 — Create your owner account"}
              </p>

              {step === "institution" ? (
                <div className="flex flex-col gap-4">
                  <Input
                    ref={orgRef}
                    label="Organization name"
                    placeholder="ABC Education Group"
                    required
                    validation="required"
                    requiredMessage="Organization name is required"
                    value={form.organizationName}
                    onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                    iconLeft={<Building2 className="w-4 h-4" />}
                  />
                  <Input
                    ref={instNameRef}
                    label="Institution name"
                    placeholder="Greenwood High School"
                    required
                    validation="required"
                    requiredMessage="Institution name is required"
                    value={form.institutionName}
                    onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                    iconLeft={<Building2 className="w-4 h-4" />}
                  />
                  <Input
                    ref={instCodeRef}
                    label="Institution code"
                    placeholder="GHS-001"
                    hint="Short unique code (2–20 characters, letters, numbers, hyphen)"
                    required
                    validation="required"
                    requiredMessage="Institution code is required"
                    value={form.institutionCode}
                    onChange={(e) => setForm({ ...form, institutionCode: e.target.value.toUpperCase() })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City"
                      placeholder="Mumbai"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                    <Input
                      label="State"
                      placeholder="Maharashtra"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                    />
                  </div>
                  <Button type="button" size="lg" className="w-full mt-2" onClick={goToOwner}>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
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
                    placeholder="owner@school.edu"
                    required
                    validation="email"
                    requiredMessage="Email is required"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    iconLeft={<Mail className="w-4 h-4" />}
                  />
                  <Input
                    ref={phoneRef}
                    label="Phone"
                    placeholder="+91 98765 43210"
                    validation="phone"
                    validationRequired={false}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <Input
                    ref={passwordRef}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    required
                    validation="password"
                    requiredMessage="Valid password is required"
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
                  <div className="flex gap-3 mt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep("institution")}>
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button type="button" size="lg" className="flex-[2]" loading={isLoading} onClick={submitApplication}>
                      {isWarming ? "Starting server…" : "Submit application"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {step !== "pending" && step !== "verify" && (
            <p className="text-sm text-mid text-center mt-6">
              Already submitted an application?{" "}
              <button
                type="button"
                className="text-brand hover:underline font-medium"
                onClick={() => {
                  if (form.email.trim()) {
                    setSubmittedEmail(form.email.trim());
                  }
                  setStep("verify");
                }}
              >
                Verify email
              </button>
            </p>
          )}

          {step !== "pending" && (
            <p className={`text-sm text-mid text-center ${step === "verify" ? "mt-4" : "mt-2"}`}>
              Already have an account?{" "}
              <Link href="/login" className="text-brand hover:underline font-medium">Sign in</Link>
            </p>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand to-brand-hover relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_50%,white_0%,transparent_60%)]" />
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="text-4xl">🎓</span>
          </div>
          <h2 className="text-white text-2xl font-bold font-display mb-3">Start your institution on GradGrid</h2>
          <p className="text-white/70 text-sm leading-[1.7]">
            Submit your application, verify your email, and our team will review and approve your institution account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-fog flex items-center justify-center text-sm text-mid">Loading…</div>}>
      <SignupWizard />
    </Suspense>
  );
}
