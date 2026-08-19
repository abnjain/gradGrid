"use client";

import React from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface SessionRow {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
}

export default function AcademicSessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: institutionId } = React.use(params);
  const { addToast } = useToast();
  const [rows, setRows] = React.useState<SessionRow[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ sessions: SessionRow[] }>(
        `/platform/institutions/${institutionId}/academic-sessions`
      );
      setRows(res.data?.sessions || []);
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load sessions",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, institutionId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      addToast({ variant: "error", title: "Name and dates are required" });
      return;
    }
    setSaving(true);
    try {
      await api.post(`/platform/institutions/${institutionId}/academic-sessions`, form);
      addToast({ variant: "success", title: "Session created" });
      setForm({ name: "", startDate: "", endDate: "", isCurrent: false });
      await load();
    } catch (err) {
      addToast({
        variant: "error",
        title: "Create failed",
        description: getApiErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  }

  const filtered = rows
    .filter((r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((r) => ({
      id: r.id,
      name: r.name,
      dates: `${r.startDate?.slice?.(0, 10) || r.startDate} → ${r.endDate?.slice?.(0, 10) || r.endDate}`,
      current: r.isCurrent ? "Current" : "—",
      status: r.isActive ? "Active" : "Inactive",
    }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-display text-ink">Academic sessions</h1>
        <p className="text-sm text-mid mt-0.5">Manage sessions for this institution</p>
      </div>

      <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end max-w-4xl">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="2026-27"
        />
        <Input
          label="Start"
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />
        <Input
          label="End"
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
        <Button type="submit" disabled={saving}>
          <Plus className="w-4 h-4" />
          {saving ? "Saving..." : "Add session"}
        </Button>
      </form>

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
            { key: "name", header: "Session", width: "180px" },
            { key: "dates", header: "Dates", width: "220px" },
            { key: "current", header: "Current", width: "100px" },
            { key: "status", header: "Status", width: "100px" },
          ]}
          data={filtered}
          keyExtractor={(i) => i.id}
          page={1}
          totalPages={1}
          totalItems={filtered.length}
        />
      )}
    </div>
  );
}
