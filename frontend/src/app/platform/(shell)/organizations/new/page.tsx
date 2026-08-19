"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

export default function FormPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast({ variant: "error", title: "Name is required" });
      return;
    }
    setSaving(true);
    try {
      await api.post("/platform/organizations", {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
      });
      addToast({ variant: "success", title: "Organization created" });
      router.push("/platform/organizations/list");
    } catch (err) {
      addToast({
        variant: "error",
        title: "Create failed",
        description: getApiErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/platform/organizations">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">New Organization</h1>
          <p className="text-sm text-mid mt-0.5">Register a new organization</p>
        </div>
      </div>
      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              placeholder="EduTrust Foundation"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Slug"
              placeholder="edutrust-foundation"
              hint="Optional — auto-generated from name if empty"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <Input
              label="Email"
              placeholder="org@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit" loading={saving}>
              <Save className="w-4 h-4" />
              Create Organization
            </Button>
            <Link href="/platform/organizations">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
