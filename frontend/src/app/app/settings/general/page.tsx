"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { DetailCard } from "@/components/ui/card";
import { Input, Select, Textarea, type InputHandle } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Building2, Save } from "lucide-react";

const COUNTRY_OPTIONS = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Australia",
  "Singapore",
  "Canada",
  "Germany",
].map((c) => ({ value: c, label: c }));

export default function GeneralSettingsPage() {
  const { addToast } = useToast();
  const nameRef = React.useRef<InputHandle>(null);
  const shortNameRef = React.useRef<InputHandle>(null);
  const emailRef = React.useRef<InputHandle>(null);
  const phoneRef = React.useRef<InputHandle>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "Demo Institution",
    shortName: "GradGrid Academy",
    address: "123 Green Avenue, Whitefield",
    city: "Indore",
    state: "Madhya Pradesh",
    country: "India",
    email: "admin@institution.edu",
    phone: "+91 98765 43210",
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    // Validate every field (do NOT short-circuit) so all errors show at once
    const results = [nameRef, shortNameRef, emailRef, phoneRef].map((r) => r.current?.validate() ?? true);
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
    window.setTimeout(() => {
      setSaving(false);
      addToast({
        variant: "success",
        title: "Settings saved",
        description: "Institution details have been updated.",
      });
    }, 600);
  };

  return (
    <SettingsPageLayout
      title="General Settings"
      description="Institution name, address, and contact details."
    >
      <DetailCard
        title="Institution Information"
        subtitle="These details appear across reports and public documents."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-brand-dim flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-brand" />
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            ref={nameRef}
            label="Institution name"
            required
            validation="name"
            requiredMessage="Institution name is required"
            placeholder="e.g. Green Valley Public School"
            value={form.name}
            onChange={set("name")}
          />
          <Input
            ref={shortNameRef}
            label="Short name / tagline"
            validation="name"
            requiredMessage="Short name is required"
            placeholder="e.g. GVPS"
            value={form.shortName}
            onChange={set("shortName")}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Address"
              placeholder="Street, area, landmark"
              value={form.address}
              onChange={set("address")}
            />
          </div>
          <Input label="City" placeholder="e.g. Indore" value={form.city} onChange={set("city")} />
          <Input
            label="State / Province"
            placeholder="e.g. Madhya Pradesh"
            value={form.state}
            onChange={set("state")}
          />
          <Select label="Country" options={COUNTRY_OPTIONS} value={form.country} onChange={set("country")} />
          <Input label="Phone" hint="Include country code" value={form.phone} onChange={set("phone")} />
          <div className="sm:col-span-2">
            <Input
              ref={emailRef}
              label="Contact email"
              required
              validation="email"
              requiredMessage="Contact email is required"
              placeholder="admin@institution.edu"
              value={form.email}
              onChange={set("email")}
            />
          </div>
        </div>
      </DetailCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
