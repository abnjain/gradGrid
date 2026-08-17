"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { DetailCard } from "@/components/ui/card";
import { Input, type InputHandle } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordStrength } from "@/components/ui/password-strength";
import { useToast } from "@/components/ui/toast";
import { api, type ApiResponse } from "@/lib/api-client";
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";

export default function ChangePasswordPage() {
  const { addToast } = useToast();

  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [changed, setChanged] = React.useState(false);
  const [form, setForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const currentRef = React.useRef<InputHandle>(null);
  const newRef = React.useRef<InputHandle>(null);
  const confirmRef = React.useRef<InputHandle>(null);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate every field (do NOT short-circuit) so all errors show at once
    const results = [currentRef, newRef, confirmRef].map((r) => r.current?.validate() ?? true);
    const valid = results.every(Boolean);
    if (!valid) return;

    setSaving(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      if (!res.success) {
        throw res;
      }

      setChanged(true);
      addToast({
        variant: "success",
        title: "Password changed",
        description: "Your password has been updated. Other sessions were signed out.",
      });
    } catch (err) {
      const apiError = err as Partial<ApiResponse>;
      const message = apiError?.error?.message || "Something went wrong. Please try again.";
      addToast({ variant: "error", title: "Password change failed", description: message });
    } finally {
      setSaving(false);
    }
  };

  // Success state — the form is replaced by a confirmation panel.
  if (changed) {
    return (
      <SettingsPageLayout
        title="Change Password"
        description="Your password has been updated."
        backHref="/app/account"
        backLabel="My Account"
      >
        <DetailCard
          title="Password updated"
          subtitle="You're still signed in on this device. Other sessions have been signed out."
          headerRight={
            <div className="w-9 h-9 rounded-lg bg-success-dim flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5 text-success" />
            </div>
          }
        >
          <p className="text-sm text-mid leading-[1.6]">
            Use your new password the next time you sign in. If you believe someone else may have
            had access to your account, we recommend reviewing your active sessions.
          </p>
          <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
            <Button onClick={() => setChanged(false)} variant="secondary">
              Change again
            </Button>
          </div>
        </DetailCard>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Change Password"
      description="Update your account password. You'll stay signed in on this device."
      backHref="/app/account"
      backLabel="My Account"
    >
      <DetailCard
        title="Account Security"
        subtitle="Choose a strong password that you don't use anywhere else."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-info-dim flex items-center justify-center">
            <KeyRound className="w-4.5 h-4.5 text-info" />
          </div>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            ref={currentRef}
            label="Current password"
            type={showCurrent ? "text" : "password"}
            required
            validation="required"
            requiredMessage="Current password is required"
            placeholder="Enter your current password"
            value={form.currentPassword}
            onChange={set("currentPassword")}
            iconLeft={<Lock className="w-4 h-4" />}
            iconRight={
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}>
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <div className="flex flex-col gap-1">
            <Input
              ref={newRef}
              label="New password"
              type={showNew ? "text" : "password"}
              required
              validation="password"
              requiredMessage="Valid password is required"
              placeholder="At least 8 characters"
              value={form.newPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              onChange={set("newPassword")}
              iconLeft={<Lock className="w-4 h-4" />}
              iconRight={
                <button type="button" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <PasswordStrength value={form.newPassword} show={passwordFocused} />
          </div>

          <Input
            ref={confirmRef}
            label="Confirm new password"
            type={showConfirm ? "text" : "password"}
            required
            validation="password"
            validateMatch={form.newPassword}
            requiredMessage="Confirm password is required"
            placeholder="Re-enter your new password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            iconLeft={<Lock className="w-4 h-4" />}
            iconRight={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit" loading={saving}>
              <KeyRound className="w-4 h-4" />
              {saving ? "Updating…" : "Update Password"}
            </Button>
            <Button variant="ghost" onClick={() => setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })}>
              Clear
            </Button>
          </div>
        </form>
      </DetailCard>
    </SettingsPageLayout>
  );
}
