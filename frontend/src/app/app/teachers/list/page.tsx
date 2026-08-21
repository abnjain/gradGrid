"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Table, PersonCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/lib/use-permissions";

interface TeacherRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeCode: string | null;
  departmentName: string | null;
  designation: string | null;
  employmentStatus: string;
}

export default function TeachersListPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [rows, setRows] = React.useState<TeacherRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
      const res = await api.get<{ teachers: TeacherRow[] }>(`/teachers${query}`);
      setRows(res.data?.teachers || []);
    } catch (err) {
      addToast({ variant: "error", title: "Failed to load teachers", description: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [addToast, searchQuery]);

  React.useEffect(() => { void load(); }, [load]);

  async function archiveTeacher(id: string) {
    if (!window.confirm("Archive this teacher record?")) return;
    try {
      await api.delete(`/teachers/${id}`);
      addToast({ variant: "success", title: "Teacher archived" });
      await load();
    } catch (err) {
      addToast({ variant: "error", title: "Archive failed", description: getApiErrorMessage(err) });
    }
  }

  const tableData = rows.map((row) => ({
    id: row.id,
    teacher: {
      name: row.name,
      subtitle: row.email,
      badge: { text: row.employmentStatus, variant: row.employmentStatus === "active" ? "status-active" : "status-inactive" },
    },
    employeeCode: row.employeeCode || "—",
    department: row.departmentName || "—",
    designation: row.designation || "—",
    phone: row.phone,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold font-display text-ink">Teachers</h1><p className="text-sm text-mid mt-0.5">Institution-scoped teaching and staff records.</p></div>
        {can("teachers.create") && <Link href="/app/teachers/new"><Button size="sm"><Plus className="w-4 h-4" />Add Teacher</Button></Link>}
      </div>
      <div className="w-72"><Input placeholder="Search teachers..." iconLeft={<Search className="w-4 h-4" />} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
      {loading ? <p className="text-sm text-mid">Loading teachers...</p> : (
        <Table
          columns={[
            { key: "teacher", header: "Teacher", sortable: true, width: "260px", render: (item: (typeof tableData)[number]) => <PersonCell person={item.teacher} /> },
            { key: "employeeCode", header: "Employee code", width: "130px" },
            { key: "department", header: "Department", width: "150px" },
            { key: "designation", header: "Designation", width: "160px" },
            { key: "phone", header: "Phone", width: "140px" },
            { key: "actions", header: "Actions", width: "160px", render: (item: (typeof tableData)[number]) => (
              <div className="flex items-center gap-2">
                {can("teachers.update") && <Button size="sm" variant="secondary" onClick={(event) => { event.stopPropagation(); router.push(`/app/teachers/${item.id}/edit`); }}>Edit</Button>}
                {can("teachers.delete") && <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); void archiveTeacher(item.id); }}>Archive</Button>}
              </div>
            ) },
          ]}
          data={tableData}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => router.push(`/app/teachers/${item.id}`)}
          page={1}
          totalPages={1}
          totalItems={tableData.length}
        />
      )}
    </div>
  );
}
