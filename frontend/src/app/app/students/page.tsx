"use client";

import React from "react";
import Link from "next/link";
import { Table, PersonCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/lib/use-permissions";

interface StudentRow {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  rollNumber: string | null;
  email: string | null;
  gender: string | null;
  status: string;
  hasPortalLogin: boolean;
}

export default function StudentsPage() {
  const { addToast } = useToast();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [rows, setRows] = React.useState<StudentRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ students: StudentRow[] }>(
        `/students${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`
      );
      setRows(res.data?.students || []);
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load students",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, searchQuery]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function invitePortal(studentId: string) {
    try {
      const res = await api.post<{ temporaryPassword?: string }>(`/students/${studentId}/portal-invite`);
      addToast({
        variant: "success",
        title: "Portal invite created",
        description: res.data?.temporaryPassword
          ? `Temp password: ${res.data.temporaryPassword}`
          : "Credentials emailed to the student.",
      });
      await load();
    } catch (err) {
      addToast({
        variant: "error",
        title: "Invite failed",
        description: getApiErrorMessage(err),
      });
    }
  }

  const tableData = rows.map((row) => ({
    id: row.id,
    name: {
      name: row.name,
      subtitle: row.email || row.admissionNumber,
      badge: {
        text: row.status,
        variant: row.status === "active" ? "status-active" : "status-inactive",
      },
    },
    admissionNumber: row.admissionNumber,
    rollNo: row.rollNumber || "—",
    gender: row.gender || "—",
    status: row.status,
    portal: row.hasPortalLogin ? "Linked" : "Not linked",
    _raw: row,
  }));

  const columns = [
    {
      key: "name",
      header: "Student",
      sortable: true,
      width: "260px",
      render: (item: (typeof tableData)[number]) => <PersonCell person={item.name} />,
    },
    { key: "admissionNumber", header: "Admission No", width: "130px" },
    { key: "rollNo", header: "Roll No", width: "100px" },
    { key: "gender", header: "Gender", width: "90px" },
    { key: "portal", header: "Portal", width: "110px" },
    {
      key: "actions",
      header: "Actions",
      width: "160px",
      render: (item: (typeof tableData)[number]) =>
        can("students.update") && !item._raw.hasPortalLogin ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              void invitePortal(item.id);
            }}
          >
            Portal invite
          </Button>
        ) : (
          <span className="text-sm text-mid">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Students</h1>
          <p className="text-sm text-mid mt-0.5">
            Institution-scoped student records. Portal invite links a student login for class and ID card only.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {can("students.view") && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                window.open("/api/v1/students/export/csv", "_blank");
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
          {can("students.create") && (
            <Link href="/app/students/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder="Search students..."
            iconLeft={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {loading && <span className="text-sm text-mid">Loading...</span>}
      </div>

      <Table
        columns={columns}
        data={tableData}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => {
          window.location.href = `/app/students/${item.id}`;
        }}
        page={1}
        totalPages={1}
        totalItems={tableData.length}
      />
    </div>
  );
}
