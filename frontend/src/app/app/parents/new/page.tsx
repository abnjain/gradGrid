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

interface StudentOption {
  id: string;
  name: string;
  admissionNumber: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  relation: string;
  phone: string;
  email: string;
  studentIds: string[];
}

const RELATIONS = ["Father", "Mother", "Guardian", "Other"];

export default function AddParentPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [students, setStudents] = React.useState<StudentOption[]>([]);
  const [form, setForm] = React.useState<FormState>({
    firstName: "",
    lastName: "",
    relation: "Father",
    phone: "",
    email: "",
    studentIds: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{ students: StudentOption[] }>("/students");
        if (!cancelled) {
          setStudents(
            (res.data?.students || []).map((student) => ({
              id: student.id,
              name: student.name,
              admissionNumber: student.admissionNumber,
            }))
          );
        }
      } catch (err) {
        if (!cancelled)
          addToast({
            variant: "error",
            title: "Failed to load students",
            description: getApiErrorMessage(err),
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  function update(field: keyof FormState, value: string | string[]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleStudent(id: string) {
    setForm((current) => ({
      ...current,
      studentIds: current.studentIds.includes(id)
        ? current.studentIds.filter((s) => s !== id)
        : [...current.studentIds, id],
    }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await api.post<{ parent: { id: string } }>("/parents", {
        ...form,
        email: form.email.trim() || undefined,
        studentIds: form.studentIds.length ? form.studentIds : undefined,
      });
      addToast({ variant: "success", title: "Parent added" });
      if (res.data?.parent.id) router.push(`/app/parents/${res.data.parent.id}`);
      else router.push("/app/parents");
    } catch (err) {
      addToast({
        variant: "error",
        title: "Unable to add parent",
        description: getApiErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-mid">Loading parent form...</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/parents">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Add Parent</h1>
          <p className="text-sm text-mid mt-0.5">
            Register a parent or guardian and link them to students.
          </p>
        </div>
      </div>

      <Card className="p-6 max-w-3xl">
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First name"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
            <Input
              label="Last name"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
            <Select
              label="Relation"
              value={form.relation}
              onChange={(e) => update("relation", e.target.value)}
              options={RELATIONS.map((relation) => ({ value: relation.toLowerCase(), label: relation }))}
            />
            <Input
              label="Phone"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-charcoal">Link to students</span>
            <p className="text-xs text-mist">
              Select one or more students. The first selection becomes the primary contact.
            </p>
            {students.length === 0 ? (
              <p className="text-sm text-mid">No students available yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {students.map((student) => {
                  const selected = form.studentIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={`flex items-center gap-3 border-[1.5px] rounded-md px-3 py-2 cursor-pointer transition-colors ${
                        selected
                          ? "border-brand bg-brand-dim"
                          : "border-border-strong hover:border-mid"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-brand w-4 h-4"
                        checked={selected}
                        onChange={() => toggleStudent(student.id)}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-ink truncate">{student.name}</span>
                        <span className="text-xs text-mid">{student.admissionNumber}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Add Parent"}
            </Button>
            <Link href="/app/parents">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
