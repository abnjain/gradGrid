"use client";

import React from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/lib/use-permissions";

interface ParentRow {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string | null;
  hasPortalLogin: boolean;
  children: Array<{ id: string; name: string; admissionNumber: string }>;
}

export default function ParentsListPage() {
  const { addToast } = useToast();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [rows, setRows] = React.useState<ParentRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ parents: ParentRow[] }>("/parents");
      setRows(res.data?.parents || []);
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load parents",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function invitePortal(parentId: string) {
    try {
      const res = await api.post<{ temporaryPassword?: string }>(`/parents/${parentId}/portal-invite`);
      addToast({
        variant: "success",
        title: "Portal invite created",
        description: res.data?.temporaryPassword
          ? `Temp password: ${res.data.temporaryPassword}`
          : "Credentials emailed.",
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

  const filtered = rows
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        r.phone.includes(q)
      );
    })
    .map((r) => ({
      id: r.id,
      name: r.name,
      relation: r.relation,
      phone: r.phone,
      email: r.email || "—",
      children: r.children.map((c) => c.name).join(", ") || "—",
      portal: r.hasPortalLogin ? "Linked" : "Not linked",
      _raw: r,
    }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Parents</h1>
          <p className="text-sm text-mid mt-0.5">
            Linked to students at this institution. Portal parents only see their linked children.
          </p>
        </div>
        {can("students.create") && (
          <Link href="/app/parents/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Parent
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
            { key: "name", header: "Parent", width: "200px" },
            { key: "relation", header: "Relation", width: "100px" },
            { key: "phone", header: "Phone", width: "140px" },
            { key: "email", header: "Email", width: "200px" },
            { key: "children", header: "Children", width: "200px" },
            { key: "portal", header: "Portal", width: "110px" },
            {
              key: "actions",
              header: "Actions",
              width: "140px",
              render: (item: (typeof filtered)[number]) =>
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
