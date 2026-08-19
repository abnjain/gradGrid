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

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  roleLabel: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

function formatLastActive(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function ListPage() {
  const { addToast } = useToast();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [rows, setRows] = React.useState<PlatformUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ users: PlatformUser[] }>("/platform/users");
      setRows(res.data?.users || []);
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load platform users",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(user: PlatformUser) {
    setBusyId(user.id);
    try {
      await api.patch(`/platform/users/${user.id}/status`, { isActive: !user.isActive });
      addToast({
        variant: "success",
        title: user.isActive ? "User deactivated" : "User activated",
      });
      await load();
    } catch (err) {
      addToast({
        variant: "error",
        title: "Update failed",
        description: getApiErrorMessage(err),
      });
    } finally {
      setBusyId(null);
    }
  }

  const filtered = rows.filter((row) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q) ||
      row.roleLabel.toLowerCase().includes(q)
    );
  });

  const tableData = filtered.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.roleLabel,
    lastActive: formatLastActive(row.lastLoginAt),
    status: row.isActive ? "Active" : "Inactive",
    _raw: row,
  }));

  const columns = [
    { key: "name", header: "User", sortable: true, width: "220px" },
    { key: "email", header: "Email", width: "240px" },
    { key: "role", header: "Role", width: "160px" },
    { key: "lastActive", header: "Last Active", width: "160px" },
    { key: "status", header: "Status", width: "100px" },
    {
      key: "actions",
      header: "Actions",
      width: "140px",
      render: (item: (typeof tableData)[number]) =>
        can("platform_users.manage") && item._raw.roleName !== "platform_super_admin" ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={busyId === item.id}
            onClick={(e) => {
              e.stopPropagation();
              void toggleActive(item._raw);
            }}
          >
            {item._raw.isActive ? "Deactivate" : "Activate"}
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
          <h1 className="text-xl font-bold font-display text-ink">Platform Users</h1>
          <p className="text-sm text-mid mt-0.5">Manage GradGrid platform administrators</p>
        </div>
        <div className="flex items-center gap-2">
          {can("platform_users.manage") && (
            <Link href="/admin/users/invite">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Invite User
              </Button>
            </Link>
          )}
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
        {loading && <span className="text-sm text-mid">Loading...</span>}
      </div>
      <Table
        columns={columns}
        data={tableData}
        keyExtractor={(i) => i.id}
        page={1}
        totalPages={1}
        totalItems={tableData.length}
      />
    </div>
  );
}
