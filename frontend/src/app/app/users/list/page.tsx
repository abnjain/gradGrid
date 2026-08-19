"use client";

import React from "react";
import { Table, PersonCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { usePermissions } from "@/lib/use-permissions";

interface UserRow {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  roleLabel: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

interface RoleOption {
  name: string;
  displayName?: string;
}

function formatLastActive(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function UsersListPage() {
  const { addToast } = useToast();
  const { can } = usePermissions();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get<{ users: UserRow[] }>("/users"),
        api.get<{ roles: RoleOption[] }>("/roles").catch(() => ({ data: { roles: [] as RoleOption[] } })),
      ]);
      setRows(usersRes.data?.users || []);
      setRoles(
        (rolesRes.data?.roles || []).filter((role) => role.name !== "institution_owner")
      );
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load users",
        description: getApiErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(user: UserRow) {
    setBusyId(user.id);
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
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

  async function changeRole(userId: string, roleName: string) {
    if (!roleName) return;
    setBusyId(userId);
    try {
      await api.patch(`/users/${userId}/role`, { roleName });
      addToast({ variant: "success", title: "Role updated" });
      await load();
    } catch (err) {
      addToast({
        variant: "error",
        title: "Role update failed",
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
    name: {
      name: row.name,
      subtitle: row.email,
      badge: { text: row.roleLabel, variant: "role-admin" },
    },
    role: row.roleLabel,
    email: row.email,
    lastActive: formatLastActive(row.lastLoginAt),
    status: row.isActive ? "Active" : "Inactive",
    _raw: row,
  }));

  const columns = [
    {
      key: "name",
      header: "User",
      sortable: true,
      width: "280px",
      render: (item: (typeof tableData)[number]) => <PersonCell person={item.name} />,
    },
    { key: "role", header: "Role", width: "140px" },
    { key: "email", header: "Email", width: "220px" },
    { key: "lastActive", header: "Last Active", width: "160px" },
    { key: "status", header: "Status", width: "100px" },
    {
      key: "actions",
      header: "Actions",
      width: "280px",
      render: (item: (typeof tableData)[number]) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {can("roles.assign") && (
            <Select
              value={item._raw.roleName}
              onChange={(e) => void changeRole(item.id, e.target.value)}
              disabled={busyId === item.id || item._raw.roleName === "institution_owner"}
              options={[
                { value: item._raw.roleName, label: item._raw.roleLabel },
                ...roles
                  .filter((r) => r.name !== item._raw.roleName)
                  .map((r) => ({
                    value: r.name,
                    label: r.displayName || r.name,
                  })),
              ]}
            />
          )}
          {can("users.deactivate") && item._raw.roleName !== "institution_owner" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={busyId === item.id}
              onClick={() => void toggleActive(item._raw)}
            >
              {item._raw.isActive ? "Deactivate" : "Activate"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-ink">Users</h1>
          <p className="text-sm text-mid mt-0.5">Invite, assign roles, and deactivate institution users</p>
        </div>
        <div className="flex items-center gap-2">
          {can("users.invite") && (
            <Link href="/app/users/invite">
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
            placeholder="Search users..."
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
        page={1}
        totalPages={1}
        totalItems={tableData.length}
      />
    </div>
  );
}
