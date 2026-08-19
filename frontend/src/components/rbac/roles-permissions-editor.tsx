"use client";

import React from "react";
import { DetailCard } from "@/components/ui/card";
import { Toggle } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api-client";
import { PermissionMatrix, type PermissionModule } from "@/components/rbac/permission-matrix";
import { Lock, Plus, Save, Shield, Trash2 } from "lucide-react";

export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isLocked: boolean;
  isActive: boolean;
  memberCount: number;
  permissionKeys: string[];
}

interface RolesPermissionsEditorProps {
  title: string;
  description: string;
  permissionsPath: string;
  rolesPath: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

function formatRoleLabel(name: string) {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function RolesPermissionsEditor({
  title,
  description,
  permissionsPath,
  rolesPath,
  canCreate,
  canUpdate,
  canDelete,
}: RolesPermissionsEditorProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [modules, setModules] = React.useState<PermissionModule[]>([]);
  const [roles, setRoles] = React.useState<RoleDto[]>([]);
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(null);
  const [draftKeys, setDraftKeys] = React.useState<string[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || null;
  const dirty =
    !!selectedRole &&
    JSON.stringify([...draftKeys].sort()) !== JSON.stringify([...selectedRole.permissionKeys].sort());

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [permissionsRes, rolesRes] = await Promise.all([
        api.get<{ modules: PermissionModule[] }>(permissionsPath),
        api.get<{ roles: RoleDto[] }>(rolesPath),
      ]);
      const nextModules = permissionsRes.data?.modules || [];
      const nextRoles = rolesRes.data?.roles || [];
      setModules(nextModules);
      setRoles(nextRoles);
      setSelectedRoleId((prev) => {
        if (prev && nextRoles.some((role) => role.id === prev)) return prev;
        return nextRoles[0]?.id ?? null;
      });
    } catch (err) {
      addToast({
        variant: "error",
        title: "Failed to load roles",
        description: getApiErrorMessage(err, "Could not load roles and permissions."),
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, permissionsPath, rolesPath]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (!selectedRole) {
      setDraftKeys([]);
      return;
    }
    setDraftKeys(selectedRole.permissionKeys);
  }, [selectedRole]);

  function toggleKey(key: string) {
    if (!canUpdate || selectedRole?.isLocked) return;
    setDraftKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  async function handleSave() {
    if (!selectedRole || selectedRole.isLocked || !canUpdate) return;
    setSaving(true);
    try {
      const res = await api.put<{ role: RoleDto }>(`${rolesPath}/${selectedRole.id}/permissions`, {
        permissionKeys: draftKeys,
      });
      const updated = res.data?.role;
      if (updated) {
        setRoles((prev) => prev.map((role) => (role.id === updated.id ? updated : role)));
        setDraftKeys(updated.permissionKeys);
      }
      addToast({
        variant: "success",
        title: "Permissions saved",
        description: `Updated permissions for ${formatRoleLabel(selectedRole.name)}.`,
      });
    } catch (err) {
      addToast({
        variant: "error",
        title: "Save failed",
        description: getApiErrorMessage(err, "Could not save permissions."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(role: RoleDto) {
    if (!canUpdate || role.isLocked) return;
    try {
      const res = await api.patch<{ role: RoleDto }>(`${rolesPath}/${role.id}`, {
        isActive: !role.isActive,
      });
      const updated = res.data?.role;
      if (updated) {
        setRoles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
    } catch (err) {
      addToast({
        variant: "error",
        title: "Update failed",
        description: getApiErrorMessage(err, "Could not update role."),
      });
    }
  }

  async function handleCreate() {
    if (!canCreate || !newName.trim()) return;
    setSaving(true);
    try {
      const res = await api.post<{ role: RoleDto }>(rolesPath, {
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        permissionKeys: [],
      });
      const created = res.data?.role;
      if (created) {
        setRoles((prev) => [...prev, created]);
        setSelectedRoleId(created.id);
      }
      setCreateOpen(false);
      setNewName("");
      setNewDescription("");
      addToast({
        variant: "success",
        title: "Role created",
        description: "Custom role created. Assign permissions and save.",
      });
    } catch (err) {
      addToast({
        variant: "error",
        title: "Create failed",
        description: getApiErrorMessage(err, "Could not create role."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(role: RoleDto) {
    if (!canDelete || role.isSystemRole) return;
    if (!window.confirm(`Delete role "${formatRoleLabel(role.name)}"?`)) return;
    try {
      await api.delete(`${rolesPath}/${role.id}`);
      setRoles((prev) => prev.filter((item) => item.id !== role.id));
      if (selectedRoleId === role.id) {
        setSelectedRoleId(null);
      }
      addToast({ variant: "success", title: "Role deleted" });
    } catch (err) {
      addToast({
        variant: "error",
        title: "Delete failed",
        description: getApiErrorMessage(err, "Could not delete role."),
      });
    }
  }

  if (loading) {
    return <div className="text-sm text-mid py-12 text-center">Loading roles and permissions...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-mid mt-0.5">{description}</p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Create role
          </Button>
        )}
      </div>

      <DetailCard
        title="Roles"
        subtitle="Select a role to edit its permission matrix."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-sensitive-dim flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-sensitive" />
          </div>
        }
      >
        <div className="flex flex-col divide-y divide-border">
          {roles.map((role) => {
            const active = role.id === selectedRoleId;
            return (
              <div
                key={role.id}
                className={`py-3 first:pt-0 last:pb-0 flex items-center gap-3 ${active ? "bg-brand/5 -mx-2 px-2 rounded-lg" : ""}`}
              >
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{formatRoleLabel(role.name)}</span>
                    {role.isLocked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-mid bg-surface-raised border border-border rounded-full px-1.5 py-[1px]">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                    {role.isSystemRole && !role.isLocked && (
                      <span className="text-[10px] font-semibold text-mid bg-surface-raised border border-border rounded-full px-1.5 py-[1px]">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-mid mt-0.5">{role.description || "No description"}</p>
                </button>
                <Badge variant="count-muted">{role.memberCount}</Badge>
                <Toggle
                  checked={role.isActive}
                  disabled={!canUpdate || role.isLocked}
                  onChange={() => toggleActive(role)}
                  aria-label={`Toggle ${formatRoleLabel(role.name)} role`}
                />
                {!role.isSystemRole && canDelete && (
                  <button
                    type="button"
                    className="text-mid hover:text-danger"
                    onClick={() => handleDelete(role)}
                    aria-label={`Delete ${formatRoleLabel(role.name)}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
          {roles.length === 0 && (
            <p className="text-sm text-mid py-4 text-center">No roles found for this workspace.</p>
          )}
        </div>
      </DetailCard>

      <DetailCard
        title="Module Permissions"
        subtitle={
          selectedRole
            ? selectedRole.isLocked
              ? `${formatRoleLabel(selectedRole.name)} permissions are locked.`
              : `Editing permissions for ${formatRoleLabel(selectedRole.name)}.`
            : "Select a role to edit permissions."
        }
      >
        {selectedRole ? (
          <PermissionMatrix
            modules={modules}
            selectedKeys={draftKeys}
            locked={!canUpdate || selectedRole.isLocked}
            onToggle={toggleKey}
          />
        ) : (
          <p className="text-sm text-mid py-6 text-center">Select a role to view the matrix.</p>
        )}
      </DetailCard>

      {selectedRole && canUpdate && !selectedRole.isLocked && (
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} disabled={!dirty}>
            <Save className="w-4 h-4" />
            Save Permissions
          </Button>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create custom role"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving} disabled={!newName.trim()}>
              Create
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Role name"
            placeholder="e.g. Transport Manager"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="What this role can do"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
