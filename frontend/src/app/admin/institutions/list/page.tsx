"use client";

import React from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface InstitutionRow {
  id: string;
  name: string;
  organizationName: string;
  code: string;
  studentCount: number;
  isActive: boolean;
  city?: string | null;
  state?: string | null;
}

const columns = [
  { key: "name", header: "Institution", sortable: true, width: "260px" },
  { key: "org", header: "Organization", width: "160px" },
  { key: "code", header: "Code", width: "100px" },
  { key: "students", header: "Students", width: "90px" },
  { key: "status", header: "Status", width: "100px" },
];

export default function ListPage() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set());
  const [rows, setRows] = React.useState<InstitutionRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get<{ institutions: InstitutionRow[] }>("/platform/institutions");
        if (!cancelled) setRows(res.data?.institutions || []);
      } catch (err) {
        if (!cancelled) {
          addToast({
            variant: "error",
            title: "Failed to load institutions",
            description: getApiErrorMessage(err),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const tableData = rows
    .filter((row) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        row.organizationName.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q)
      );
    })
    .map((row) => ({
      id: row.id,
      name: row.name,
      org: row.organizationName,
      code: row.code,
      students: String(row.studentCount),
      status: row.isActive ? "Active" : "Inactive",
    }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">All Institutions</h1>
          <p className="text-sm text-mid mt-0.5">View and manage all registered institutions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/institutions/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-72">
          <Input
            placeholder="Search..."
            iconLeft={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <p className="text-sm text-mid py-8 text-center">Loading institutions...</p>
      ) : (
        <Table
          columns={columns}
          data={tableData}
          keyExtractor={(i) => i.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          page={1}
          totalPages={1}
          totalItems={tableData.length}
        />
      )}
    </div>
  );
}
