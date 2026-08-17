"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { DetailCard } from "@/components/ui/card";
import { Checkbox, Toggle } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Shield,
  Save,
  GraduationCap,
  ClipboardCheck,
  DollarSign,
  BarChart3,
  MessageSquare,
  Settings,
  Lock,
} from "lucide-react";

interface Role {
  name: string;
  description: string;
  members: number;
  active: boolean;
  locked?: boolean;
}

const MODULES = [
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
  { key: "finance", label: "Finance", icon: DollarSign },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "communication", label: "Communication", icon: MessageSquare },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

const ACTIONS = ["View", "Create", "Edit", "Delete"] as const;

export default function RolesPermissionsPage() {
  const { addToast } = useToast();
  const [roles, setRoles] = React.useState<Role[]>([
    { name: "Administrator", description: "Full access to every module and setting", members: 3, active: true, locked: true },
    { name: "Principal", description: "Oversees academics, staff, and reports", members: 1, active: true },
    { name: "Teacher", description: "Manages classes, attendance, and exams", members: 24, active: true },
    { name: "Accountant", description: "Handles fees, payroll, and invoices", members: 2, active: true },
    { name: "Parent", description: "Views reports and payment history", members: 180, active: false },
    { name: "Student", description: "Accesses personal records and results", members: 320, active: false },
  ]);

  const [perm, setPerm] = React.useState<Record<string, boolean>>({
    "students.view": true, "students.create": true, "students.edit": true, "students.delete": false,
    "attendance.view": true, "attendance.create": true, "attendance.edit": true, "attendance.delete": false,
    "finance.view": true, "finance.create": false, "finance.edit": false, "finance.delete": false,
    "reports.view": true, "reports.create": true, "reports.edit": false, "reports.delete": false,
    "communication.view": true, "communication.create": true, "communication.edit": true, "communication.delete": false,
    "settings.view": true, "settings.create": false, "settings.edit": true, "settings.delete": false,
  });

  const toggleRole = (name: string) => {
    setRoles((prev) =>
      prev.map((r) => (r.name === name && !r.locked ? { ...r, active: !r.active } : r))
    );
  };

  const togglePerm = (key: string) => setPerm((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    addToast({
      variant: "success",
      title: "Permissions saved",
      description: "Role and permission changes have been applied.",
    });
  };

  return (
    <SettingsPageLayout
      title="Roles & Permissions"
      description="View and manage roles and permissions."
    >
      <DetailCard
        title="Roles"
        subtitle="Enable or disable roles available in your institution."
        headerRight={
          <div className="w-9 h-9 rounded-lg bg-sensitive-dim flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-sensitive" />
          </div>
        }
      >
        <div className="flex flex-col divide-y divide-border">
          {roles.map((role) => (
            <div key={role.name} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{role.name}</span>
                  {role.locked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-mid bg-surface-raised border border-border rounded-full px-1.5 py-[1px]">
                      <Lock className="w-2.5 h-2.5" />
                      Always on
                    </span>
                  )}
                </div>
                <p className="text-xs text-mid mt-0.5">{role.description}</p>
              </div>
              <Badge variant="count-muted">{role.members}</Badge>
              <Toggle
                checked={role.active}
                disabled={role.locked}
                onChange={() => toggleRole(role.name)}
                aria-label={`Toggle ${role.name} role`}
              />
            </div>
          ))}
        </div>
      </DetailCard>

      <DetailCard
        title="Module Permissions"
        subtitle="Control what each role can do within every module."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[520px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-xs font-semibold text-mid uppercase tracking-wide">Module</th>
                {ACTIONS.map((a) => (
                  <th key={a} className="text-center py-2 px-2 text-xs font-semibold text-mid uppercase tracking-wide">
                    {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => {
                const Icon = m.icon;
                return (
                  <tr key={m.key} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-md bg-surface-raised flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5 text-mid" />
                        </span>
                        <span className="text-sm font-medium text-ink">{m.label}</span>
                      </div>
                    </td>
                    {ACTIONS.map((a) => {
                      const key = `${m.key}.${a.toLowerCase()}`;
                      return (
                        <td key={key} className="text-center py-2.5 px-2">
                          <Checkbox
                            checked={perm[key]}
                            onChange={() => togglePerm(key)}
                            aria-label={`${m.label} ${a}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DetailCard>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save Permissions
        </Button>
      </div>
    </SettingsPageLayout>
  );
}
