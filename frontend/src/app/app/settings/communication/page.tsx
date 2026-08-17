"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { DetailCard } from "@/components/ui/card";
import { Input, type InputHandle } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Mail, MessageCircle, Save, Send, Eye, EyeOff } from "lucide-react";

export default function CommunicationSettingsPage() {
  const { addToast } = useToast();
  const hostRef = React.useRef<InputHandle>(null);
  const fromRef = React.useRef<InputHandle>(null);
  const waNumberRef = React.useRef<InputHandle>(null);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [showSmptPw, setShowSmptPw] = React.useState(false);
  const [showWaKey, setShowWaKey] = React.useState(false);
  const [email, setEmail] = React.useState({
    host: "smtp.institution.edu",
    port: "587",
    username: "noreply@institution.edu",
    password: "",
    from: "noreply@institution.edu",
    encryption: "STARTTLS",
  });
  const [whatsapp, setWhatsapp] = React.useState({
    enabled: false,
    number: "+91 98765 43210",
    apiKey: "",
  });

  const setEmailField = (key: keyof typeof email) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail((prev) => ({ ...prev, [key]: e.target.value }));
  const setWaField = (key: keyof typeof whatsapp) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setWhatsapp((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    // Validate every field (do NOT short-circuit) so all errors show at once
    const results = [hostRef, fromRef, waNumberRef].map((r) => r.current?.validate() ?? true);
    const valid = results.every(Boolean);
    if (!valid) {
      addToast({
        variant: "error",
        title: "Please fix the highlighted fields",
        description: "Some fields are missing or invalid.",
      });
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      addToast({
        variant: "success",
        title: "Communication settings saved",
        description: "Email and WhatsApp configuration has been updated.",
      });
    }, 600);
  };

  const handleTest = () => {
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      addToast({
        variant: "success",
        title: "Test email sent",
        description: "A test email was sent to your inbox.",
      });
    }, 900);
  };

  return (
    <SettingsPageLayout
      title="Communication"
      description="Email and WhatsApp configuration."
    >
      <DetailCard
        title="Email (SMTP)"
        subtitle="Used to send notifications, receipts, and reports."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-info-dim flex items-center justify-center">
            <Mail className="w-4.5 h-4.5 text-info" />
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            ref={hostRef}
            label="SMTP host"
            required
            validation="name"
            requiredMessage="SMTP host is required"
            placeholder="smtp.yourmail.com"
            value={email.host}
            onChange={setEmailField("host")}
          />
          <Input
            label="Port"
            placeholder="587"
            value={email.port}
            onChange={setEmailField("port")}
          />
          <Input
            label="Username"
            placeholder="noreply@institution.edu"
            value={email.username}
            onChange={setEmailField("username")}
          />
          <Input
            label="Password"
            type={showSmptPw ? "text" : "password"}
            placeholder="••••••••"
            value={email.password}
            onChange={setEmailField("password")}
            iconRight={
              <button type="button" onClick={() => setShowSmptPw((s) => !s)} aria-label={showSmptPw ? "Hide SMTP password" : "Show SMTP password"}>
                {showSmptPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="sm:col-span-2">
            <Input
              ref={fromRef}
              label="From email"
              required
              validation="email"
              requiredMessage="From email is required"
              placeholder="noreply@institution.edu"
              value={email.from}
              onChange={setEmailField("from")}
            />
          </div>
        </div>
      </DetailCard>

      <DetailCard
        title="WhatsApp"
        subtitle="Send instant updates and alerts to parents."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-success-dim flex items-center justify-center">
            <MessageCircle className="w-4.5 h-4.5 text-success" />
          </div>
        }
      >
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-ink">Enable WhatsApp notifications</p>
            <p className="text-xs text-mid mt-0.5">Send attendance and fee alerts via WhatsApp.</p>
          </div>
          <Toggle
            checked={whatsapp.enabled}
            onChange={() => setWhatsapp((prev) => ({ ...prev, enabled: !prev.enabled }))}
            aria-label="Enable WhatsApp notifications"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <Input
            ref={waNumberRef}
            label="Business number"
            validation="phone"
            requiredMessage="Business number is required"
            placeholder="+91 98765 43210"
            value={whatsapp.number}
            onChange={setWaField("number")}
          />
          <Input
            label="API token"
            type={showWaKey ? "text" : "password"}
            placeholder="Enter your WhatsApp API token"
            value={whatsapp.apiKey}
            onChange={setWaField("apiKey")}
            iconRight={
              <button type="button" onClick={() => setShowWaKey((s) => !s)} aria-label={showWaKey ? "Hide API token" : "Show API token"}>
                {showWaKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>
      </DetailCard>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={handleTest} loading={testing}>
          <Send className="w-4 h-4" />
          Send Test Email
        </Button>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
