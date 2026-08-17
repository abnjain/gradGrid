"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { DetailCard } from "@/components/ui/card";
import { Input, type InputHandle } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { api, type ApiResponse } from "@/lib/api-client";
import { UserCircle, Save } from "lucide-react";

interface ProfileResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    userType: string;
    institutionId?: string | null;
  };
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  // Split the combined display name into first/last for the form.
  const parts = (user?.name || "").trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  const [form, setForm] = React.useState({
    firstName,
    lastName,
    phone: "",
  });
  const [saving, setSaving] = React.useState(false);

  const firstNameRef = React.useRef<InputHandle>(null);
  const lastNameRef = React.useRef<InputHandle>(null);
  const phoneRef = React.useRef<InputHandle>(null);

  // Fetch the server-side profile so the form reflects the DB (incl. phone).
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ProfileResponse>("/auth/me");
        if (!cancelled && res.success && res.data?.user) {
          const u = res.data.user;
          setForm({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            phone: u.phone || "",
          });
          return;
        }
      } catch {
        // Fall through to auth-context values
      }
      if (!cancelled) {
        // Fall back to the auth-context display name (server fetch failed,
        // e.g. token refresh still in flight or a network error).
        const parts = (user?.name || "").trim().split(/\s+/);
        setForm((prev) => ({
          ...prev,
          firstName: parts[0] || prev.firstName,
          lastName: parts.slice(1).join(" ") || prev.lastName,
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    // Validate every field (do NOT short-circuit) so all errors show at once
    const results = [firstNameRef, lastNameRef, phoneRef].map((r) => r.current?.validate() ?? true);
    const valid = results.every(Boolean);
    if (!valid) {
      addToast({
        variant: "error",
        title: "Please fix the highlighted fields",
        description: "Some required fields are missing or invalid.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch<ProfileResponse>("/auth/profile", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || null,
      });

      if (!res.success) {
        throw res;
      }

      // Keep the header/sidebar name in sync
      updateUser({ name: `${form.firstName.trim()} ${form.lastName.trim()}` });

      addToast({
        variant: "success",
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (err) {
      const apiError = err as Partial<ApiResponse>;
      const message = apiError?.error?.message || "Something went wrong. Please try again.";
      addToast({ variant: "error", title: "Update failed", description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsPageLayout
      title="My Profile"
      description="View and edit your personal account information."
      backHref="/app/account"
      backLabel="My Account"
    >
      <DetailCard
        title="Profile Information"
        subtitle="Your name is shown across the portal. Email cannot be changed here."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-brand-dim flex items-center justify-center">
            <UserCircle className="w-4.5 h-4.5 text-brand" />
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            ref={firstNameRef}
            label="First name"
            required
            validation="name"
            requiredMessage="First name is required"
            placeholder="e.g. Jane"
            value={form.firstName}
            onChange={set("firstName")}
          />
          <Input
            ref={lastNameRef}
            label="Last name"
            required
            validation="name"
            requiredMessage="Last name is required"
            placeholder="e.g. Doe"
            value={form.lastName}
            onChange={set("lastName")}
          />
          <div className="sm:col-span-2">
            <Input
              label="Email address"
              disabled
              value={user?.email || ""}
              hint="Contact an administrator to change your email."
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              ref={phoneRef}
              label="Phone number"
              validation="phone"
              hint="Optional. Include country code, e.g. +91 98765 43210."
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={set("phone")}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border mt-2">
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Cancel
          </Button>
        </div>
      </DetailCard>
    </SettingsPageLayout>
  );
}
