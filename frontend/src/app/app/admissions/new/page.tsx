"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface Session { id: string; name: string; isCurrent: boolean; }

export default function NewAdmissionFormPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [form, setForm] = React.useState({ academicSessionId: "", studentFirstName: "", studentLastName: "", parentName: "", parentPhone: "", parentEmail: "", applyingForClass: "", source: "walk_in" });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{ sessions: Session[] }>("/institutions/me/academic-sessions");
        const values = res.data?.sessions || [];
        if (!cancelled) { setSessions(values); setForm((current) => ({ ...current, academicSessionId: values.find((session) => session.isCurrent)?.id || values[0]?.id || "" })); }
      } catch (err) { addToast({ variant: "error", title: "Failed to load academic sessions", description: getApiErrorMessage(err) }); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [addToast]);

  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      const res = await api.post<{ enquiry: { id: string } }>("/admissions", { ...form, parentEmail: form.parentEmail || undefined, applyingForClass: form.applyingForClass || undefined });
      addToast({ variant: "success", title: "Admission enquiry created" });
      if (res.data?.enquiry.id) router.push(`/app/admissions/${res.data.enquiry.id}`); else router.push("/app/admissions/pipeline");
    } catch (err) { addToast({ variant: "error", title: "Unable to create enquiry", description: getApiErrorMessage(err) }); }
    finally { setSaving(false); }
  }
  if (loading) return <p className="text-sm text-mid">Loading admission form...</p>;
  return (
    <div className="flex flex-col gap-5"><div className="flex items-center gap-3"><Link href="/app/admissions/pipeline"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link><div><h1 className="text-xl font-bold font-display text-ink">New Admission Enquiry</h1><p className="text-sm text-mid mt-0.5">Create an institution-scoped admission enquiry.</p></div></div>
      <Card className="p-6 max-w-3xl"><form className="flex flex-col gap-5" onSubmit={submit}><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Select label="Academic session" required value={form.academicSessionId} onChange={(e) => update("academicSessionId", e.target.value)} placeholder="Select session" options={sessions.map((session) => ({ value: session.id, label: `${session.name}${session.isCurrent ? " (Current)" : ""}` }))} /><Input label="Applying for class" value={form.applyingForClass} onChange={(e) => update("applyingForClass", e.target.value)} /><Input label="Student first name" required value={form.studentFirstName} onChange={(e) => update("studentFirstName", e.target.value)} /><Input label="Student last name" required value={form.studentLastName} onChange={(e) => update("studentLastName", e.target.value)} /><Input label="Parent or guardian name" required value={form.parentName} onChange={(e) => update("parentName", e.target.value)} /><Input label="Parent phone" required value={form.parentPhone} onChange={(e) => update("parentPhone", e.target.value)} /><Input label="Parent email" type="email" value={form.parentEmail} onChange={(e) => update("parentEmail", e.target.value)} /><Select label="Source" value={form.source} onChange={(e) => update("source", e.target.value)} options={[{ value: "walk_in", label: "Walk-in" }, { value: "website", label: "Website" }, { value: "referral", label: "Referral" }, { value: "phone", label: "Phone" }]} /></div><div className="flex items-center gap-3 pt-2 border-t border-border"><Button type="submit" disabled={saving || !form.academicSessionId}><Save className="w-4 h-4" />{saving ? "Saving..." : "Create Enquiry"}</Button><Link href="/app/admissions/pipeline"><Button variant="ghost" type="button">Cancel</Button></Link></div></form></Card>
    </div>
  );
}
