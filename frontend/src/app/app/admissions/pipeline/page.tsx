"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
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

export default function AdmissionsPipelinePage() {
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
    const admissionNumber = window.prompt("Admission number for new student?");
    if (!admissionNumber) return;
    try {
      await api.post(`/admissions/${id}/convert`, { admissionNumber });
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
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.parentName.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Admissions pipeline</h1>
          <p className="text-sm text-mid mt-0.5">Enquiry → convert creates student and parent link at this institution</p>
        </div>
        {can("admissions.create") && (
          <Link href="/app/admissions/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              New enquiry
            </Button>
          </Link>
        )}
      </div>
      <div className="w-72">
        <Input
          placeholder="Search..."
          iconLeft={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {loading ? (
        <p className="text-sm text-mid">Loading...</p>
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
              width: "140px",
              render: (item: (typeof filtered)[number]) =>
                can("admissions.convert") && item._raw.status !== "converted" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      void convert(item.id);
                    }}
                  >
                    Convert
                  </Button>
                ) : (
                  <span className="text-sm text-mid">—</span>
                ),
            },
          ]}
          data={filtered}
          keyExtractor={(i) => i.id}
          onRowClick={(item) => router.push(`/app/admissions/${item.id}`)}
          page={1}
          totalPages={1}
          totalItems={filtered.length}
        />
      )}
    </div>
  );
}
