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

interface OrgOption {
  id: string;
  name: string;
}

export default function FormPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [orgs, setOrgs] = React.useState<OrgOption[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    organizationId: "",
    name: "",
    code: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });

  React.useEffect(() => {
    void api
      .get<{ organizations: OrgOption[] }>("/platform/organizations")
      .then((res) => setOrgs(res.data?.organizations || []))
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.organizationId || !form.name.trim() || !form.code.trim()) {
      addToast({ variant: "error", title: "Missing fields", description: "Organization, name, and code are required." });
      return;
    }
    setSaving(true);
    try {
      await api.post("/platform/institutions", {
        organizationId: form.organizationId,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
      });
      addToast({ variant: "success", title: "Institution created" });
      router.push("/admin/institutions/list");
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
        <Link href="/admin/institutions">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">New Institution</h1>
          <p className="text-sm text-mid mt-0.5">Register a new institution on the platform</p>
        </div>
      </div>
      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-charcoal">Organization</span>
              <select
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink"
                value={form.organizationId}
                onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                required
              >
                <option value="">Select organization</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Institution name"
              placeholder="Greenwood High School"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Code"
              placeholder="GHS-001"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
            />
            <Input
              label="Email"
              placeholder="admin@school.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="+91..."
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
              Create Institution
            </Button>
            <Link href="/admin/institutions">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
