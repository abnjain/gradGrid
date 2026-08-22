"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, UserPlus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, DetailCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/input";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/lib/use-permissions";

interface ParentChild {
  id: string;
  name: string;
  admissionNumber: string;
  isPrimary: boolean;
}

interface ParentRow {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  relation: string;
  phone: string;
  email: string | null;
  hasPortalLogin: boolean;
  children: ParentChild[];
}

interface StudentOption {
  id: string;
  name: string;
  admissionNumber: string;
}

export default function ParentDetailsPage() {
  const params = useParams<{ id: string }>();
  const { addToast } = useToast();
  const { can } = usePermissions();
  const [parent, setParent] = React.useState<ParentRow | null>(null);
  const [students, setStudents] = React.useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = React.useState("");
  const [linking, setLinking] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [inviting, setInviting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ parents: ParentRow[] }>("/parents");
      const found = (res.data?.parents || []).find((item) => item.id === params.id) || null;
      setParent(found);
      if (!found) {
        addToast({ variant: "error", title: "Parent not found" });
      }
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load parent",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, params.id]);

  const loadStudents = React.useCallback(async () => {
    try {
      const res = await api.get<{ students: StudentOption[] }>("/students");
      setStudents(res.data?.students || []);
    } catch {
      // Non-blocking: linking panel simply shows no options on failure.
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (can("students.update")) void loadStudents();
  }, [can, loadStudents]);

  async function invitePortal() {
    if (!parent) return;
    setInviting(true);
    try {
      const res = await api.post<{ temporaryPassword?: string }>(
        `/parents/${parent.id}/portal-invite`
      );
      addToast({
        variant: "success",
        title: "Portal invite created",
        description: res.data?.temporaryPassword
          ? `Temp password: ${res.data.temporaryPassword}`
          : "Credentials emailed to the parent.",
      });
      await load();
    } catch (err) {
      addToast({
        variant: "error",
        title: "Invite failed",
        description: getApiErrorMessage(err),
      });
    } finally {
      setInviting(false);
    }
  }

  async function linkStudent() {
    if (!parent || !selectedStudent) return;
    setLinking(true);
    try {
      await api.post(`/parents/${parent.id}/link-student`, {
        studentId: selectedStudent,
        isPrimary: parent.children.length === 0,
      });
      addToast({ variant: "success", title: "Student linked" });
      setSelectedStudent("");
      await load();
    } catch (err) {
      addToast({
        variant: "error",
        title: "Link failed",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLinking(false);
    }
  }

  if (loading) return <p className="text-sm text-mid">Loading parent...</p>;
  if (!parent) return <p className="text-sm text-mid">Parent not found.</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/parents">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Avatar name={parent.name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-ink">{parent.name}</h1>
              <Badge
                variant={parent.hasPortalLogin ? "status-active" : "status-pending"}
              >
                {parent.hasPortalLogin ? "Portal linked" : "No portal login"}
              </Badge>
            </div>
            <p className="text-sm text-mid mt-0.5">{parent.relation}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {can("students.update") && !parent.hasPortalLogin && (
            <Button
              variant="secondary"
              size="sm"
              disabled={inviting || !parent.email}
              onClick={() => void invitePortal()}
              title={!parent.email ? "Parent email is required to invite" : undefined}
            >
              <UserPlus className="w-4 h-4" />
              {inviting ? "Inviting..." : "Portal invite"}
            </Button>
          )}
          {can("students.update") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById("link-student-panel")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Link2 className="w-4 h-4" />
              Link student
            </Button>
          )}
        </div>
      </div>

      <DetailCard title="Contact" className="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-mid font-medium uppercase tracking-wide">Phone</span>
            <p className="text-sm text-ink mt-0.5 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-mid" />
              {parent.phone}
            </p>
          </div>
          <div>
            <span className="text-xs text-mid font-medium uppercase tracking-wide">Email</span>
            <p className="text-sm text-ink mt-0.5 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-mid" />
              {parent.email || "—"}
            </p>
          </div>
        </div>
      </DetailCard>

      {can("students.update") && (
        <Card id="link-student-panel" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-ink">Link a student</h2>
              <p className="text-sm text-mid">
                Attach a student to this parent. The first link becomes the primary contact.
              </p>
            </div>
            <Link2 className="w-5 h-5 text-mid" />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Select
                label="Student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                placeholder="Select a student"
                options={students
                  .filter((student) => !parent.children.some((child) => child.id === student.id))
                  .map((student) => ({ value: student.id, label: `${student.name} (${student.admissionNumber})` }))}
              />
            </div>
            <Button
              disabled={!selectedStudent || linking}
              onClick={() => void linkStudent()}
            >
              <Link2 className="w-4 h-4" />
              {linking ? "Linking..." : "Link"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-ink">Linked students</h2>
            <p className="text-sm text-mid">
              Portal parents only see their linked children.
            </p>
          </div>
          <Badge variant="count">{parent.children.length}</Badge>
        </div>
        {parent.children.length === 0 ? (
          <p className="text-sm text-mid">No students linked yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {parent.children.map((child) => (
              <Link
                key={child.id}
                href={`/app/students/${child.id}`}
                className="flex items-center gap-3 border border-border rounded-md px-3 py-2 hover:bg-fog/60 transition-colors"
              >
                <Avatar name={child.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{child.name}</p>
                  <p className="text-xs text-mid">{child.admissionNumber}</p>
                </div>
                {child.isPrimary && (
                  <Badge variant="category-teal">Primary</Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
