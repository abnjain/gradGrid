"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/lib/use-permissions";

interface EnquiryRow {
  id: string;
  status: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  applyingForClass: string | null;
  createdAt: string;
}

export default function ConvertAdmissionsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { can } = usePermissions();
  const [rows, setRows] = React.useState<EnquiryRow[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ enquiries: EnquiryRow[] }>("/admissions");
      setRows(res.data?.enquiries || []);
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load enquiries",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function convert(id: string) {
    const admissionNumber = window.prompt("Admission number for the new student?");
    if (!admissionNumber || !admissionNumber.trim()) return;
    try {
      await api.post(`/admissions/${id}/convert`, {
        admissionNumber: admissionNumber.trim(),
      });
      addToast({ variant: "success", title: "Converted to student" });
      await load();
    } catch (err) {
      addToast({
        variant: "error",
        title: "Convert failed",
        description: getApiErrorMessage(err),
      });
    }
  }

  const filtered = rows
    .filter((r) => r.status !== "converted")
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.parentName.toLowerCase().includes(q) ||
        r.parentPhone.toLowerCase().includes(q)
      );
    })
    .map((r) => ({
      id: r.id,
      student: r.studentName,
      parent: r.parentName,
      phone: r.parentPhone,
      class: r.applyingForClass || "—",
      status: r.status,
      _raw: r,
    }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/app/admissions/pipeline">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Convert to Student</h1>
          <p className="text-sm text-mid mt-0.5">
            Approve an enquiry — this creates a student record and links the parent.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-ink">Pending enquiries</h2>
              <p className="text-sm text-mid">
                Only non-converted enquiries are shown here.
              </p>
            </div>
            <Badge variant="count">{filtered.length}</Badge>
          </div>
          <div className="w-72">
            <Input
              placeholder="Search pending..."
              iconLeft={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-mid">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-mid">
            No pending enquiries to convert. Create one from the admissions pipeline first.
          </p>
        ) : (
          <Table
            columns={[
              { key: "student", header: "Student", width: "180px" },
              { key: "parent", header: "Parent", width: "160px" },
              { key: "phone", header: "Phone", width: "140px" },
              { key: "class", header: "Class", width: "100px" },
              { key: "status", header: "Status", width: "120px" },
              {
                key: "actions",
                header: "Actions",
                width: "120px",
                render: (item: (typeof filtered)[number]) =>
                  can("admissions.convert") ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        void convert(item.id);
                      }}
                    >
                      <UserPlus className="w-4 h-4" />
                      Convert
                    </Button>
                  ) : (
                    <span className="text-sm text-mid">—</span>
                  ),
              },
            ]}
            data={filtered}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => router.push(`/app/admissions/${item.id}`)}
            page={1}
            totalPages={1}
            totalItems={filtered.length}
          />
        )}
      </Card>
    </div>
  );
}
