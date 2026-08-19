"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface RoleOption {
  name: string;
  displayName?: string;
}

export default function FormPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [form, setForm] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    roleName: "",
  });

  React.useEffect(() => {
    let cancelled = false;
    async function loadRoles() {
      try {
        const res = await api.get<{ roles: RoleOption[] }>("/platform/roles");
        if (!cancelled) {
          setRoles(res.data?.roles || []);
        }
      } catch (err) {
        if (!cancelled) {
          addToast({
            variant: "error",
            title: "Failed to load roles",
            description: getApiErrorMessage(err),
          });
        }
      }
    }
    void loadRoles();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email.trim() || !form.firstName.trim() || !form.lastName.trim() || !form.roleName) {
      addToast({ variant: "error", title: "Fill all required fields" });
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<{
        user: { temporaryPassword?: string };
      }>("/platform/users/invite", {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        roleName: form.roleName,
      });
      const temp = res.data?.user?.temporaryPassword;
      addToast({
        variant: "success",
        title: "Platform user invited",
        description: temp
          ? `Temporary password (SMTP not configured): ${temp}`
          : "Credentials were emailed to the user.",
      });
      router.push("/admin/users/list");
    } catch (err) {
      addToast({
        variant: "error",
        title: "Invite failed",
        description: getApiErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/users/list">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Invite Platform User</h1>
          <p className="text-sm text-mid mt-0.5">Invite a new GradGrid platform administrator</p>
        </div>
      </div>
      <Card className="p-6 max-w-2xl">
        <form className="flex flex-col gap-5" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              required
              placeholder="user@gradgrid.app"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Select
              label="Role"
              required
              placeholder="Select role"
              value={form.roleName}
              onChange={(e) => setForm({ ...form, roleName: e.target.value })}
              options={[
                { value: "", label: "Select role" },
                ...roles.map((role) => ({
                  value: role.name,
                  label: role.displayName || role.name,
                })),
              ]}
            />
            <Input
              label="First name"
              required
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Last name"
              required
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Sending..." : "Send Invitation"}
            </Button>
            <Link href="/admin/users/list">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
