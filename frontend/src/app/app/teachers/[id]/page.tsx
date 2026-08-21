"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface Teacher { id: string; name: string; email: string; phone: string; employeeCode: string | null; departmentName: string | null; designation: string | null; qualification: string | null; experienceYears: number | null; employmentStatus: string; joiningDate: string | null; }

export default function TeacherDetailsPage() {
  const params = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [teacher, setTeacher] = React.useState<Teacher | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try { const res = await api.get<{ teacher: Teacher }>(`/teachers/${params.id}`); if (!cancelled) setTeacher(res.data?.teacher || null); }
      catch (err) { addToast({ variant: "error", title: "Failed to load teacher", description: getApiErrorMessage(err) }); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [addToast, params.id]);
  if (loading) return <p className="text-sm text-mid">Loading teacher...</p>;
  if (!teacher) return <p className="text-sm text-mid">Teacher not found.</p>;
  return (
    <div className="flex flex-col gap-5"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Link href="/app/teachers/list"><Button variant="ghost" size="icon-sm"><ArrowLeft className="w-4 h-4" /></Button></Link><div><h1 className="text-xl font-bold font-display text-ink">{teacher.name}</h1><p className="text-sm text-mid mt-0.5">Teacher details</p></div></div><Link href={`/app/teachers/${teacher.id}/edit`}><Button size="sm"><Edit className="w-4 h-4" />Edit</Button></Link></div>
      <Card className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm"><div><p className="text-mid">Email</p><p className="text-ink">{teacher.email}</p></div><div><p className="text-mid">Phone</p><p className="text-ink">{teacher.phone}</p></div><div><p className="text-mid">Employee code</p><p className="text-ink">{teacher.employeeCode || "—"}</p></div><div><p className="text-mid">Department</p><p className="text-ink">{teacher.departmentName || "—"}</p></div><div><p className="text-mid">Designation</p><p className="text-ink">{teacher.designation || "—"}</p></div><div><p className="text-mid">Qualification</p><p className="text-ink">{teacher.qualification || "—"}</p></div><div><p className="text-mid">Experience</p><p className="text-ink">{teacher.experienceYears == null ? "—" : `${teacher.experienceYears} years`}</p></div><div><p className="text-mid">Employment status</p><p className="text-ink">{teacher.employmentStatus}</p></div></div></Card>
    </div>
  );
}
