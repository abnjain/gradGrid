"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

type TeacherForm = { firstName: string; lastName: string; email: string; phone: string; employeeCode: string; designation: string; qualification: string; experienceYears: string; joiningDate: string; employmentStatus: string };
const initialForm: TeacherForm = { firstName: "", lastName: "", email: "", phone: "", employeeCode: "", designation: "", qualification: "", experienceYears: "", joiningDate: "", employmentStatus: "active" };

export default function AddNewTeacherFormPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [form, setForm] = React.useState(initialForm);
  const [saving, setSaving] = React.useState(false);
  function update(field: keyof TeacherForm, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/teachers", { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, employeeCode: form.employeeCode || undefined, designation: form.designation || undefined, qualification: form.qualification || undefined, experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined, joiningDate: form.joiningDate || undefined, employmentStatus: form.employmentStatus });
      addToast({ variant: "success", title: "Teacher added" });
      router.push("/app/teachers/list");
    } catch (err) {
      addToast({ variant: "error", title: "Unable to add teacher", description: getApiErrorMessage(err) });
    } finally { setSaving(false); }
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3"><Link href="/app/teachers/list"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link><div><h1 className="text-xl font-bold font-display text-ink">Add Teacher</h1><p className="text-sm text-mid mt-0.5">Create an institution-scoped staff record.</p></div></div>
      <Card className="p-6 max-w-3xl"><form className="flex flex-col gap-5" onSubmit={submit}><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First name" required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /><Input label="Last name" required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /><Input label="Email" required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /><Input label="Phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} /><Input label="Employee code" value={form.employeeCode} onChange={(e) => update("employeeCode", e.target.value)} /><Input label="Designation" value={form.designation} onChange={(e) => update("designation", e.target.value)} /><Input label="Qualification" value={form.qualification} onChange={(e) => update("qualification", e.target.value)} /><Input label="Experience (years)" type="number" min="0" value={form.experienceYears} onChange={(e) => update("experienceYears", e.target.value)} /><Input label="Joining date" type="date" value={form.joiningDate} onChange={(e) => update("joiningDate", e.target.value)} />
        <label className="flex flex-col gap-1 text-sm font-medium text-charcoal">Employment status<select className="w-full h-[38px] px-3 text-sm text-ink bg-surface border-[1.5px] border-border-strong rounded-md" value={form.employmentStatus} onChange={(e) => update("employmentStatus", e.target.value)}><option value="active">Active</option><option value="on_leave">On leave</option><option value="inactive">Inactive</option></select></label>
      </div><div className="flex items-center gap-3 pt-2 border-t border-border"><Button type="submit" disabled={saving}><Save className="w-4 h-4" />{saving ? "Saving..." : "Add Teacher"}</Button><Link href="/app/teachers/list"><Button variant="ghost" type="button">Cancel</Button></Link></div></form></Card>
    </div>
  );
}
