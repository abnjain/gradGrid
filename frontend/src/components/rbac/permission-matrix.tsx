"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

export interface PermissionEntry {
  key: string;
  action: string;
  description: string;
}

export interface PermissionModule {
  key: string;
  label: string;
  permissions: PermissionEntry[];
}

interface PermissionMatrixProps {
  modules: PermissionModule[];
  selectedKeys: string[];
  locked?: boolean;
  onToggle: (key: string) => void;
}

function titleCaseAction(action: string) {
  return action
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PermissionMatrix({
  modules,
  selectedKeys,
  locked = false,
  onToggle,
}: PermissionMatrixProps) {
  const selected = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const actions = React.useMemo(() => {
    const seen: string[] = [];
    for (const module of modules) {
      for (const permission of module.permissions) {
        if (!seen.includes(permission.action)) seen.push(permission.action);
      }
    }
    return seen;
  }, [modules]);

  if (modules.length === 0) {
    return <p className="text-sm text-mid py-6 text-center">No permissions available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-3 text-xs font-semibold text-mid uppercase tracking-wide sticky left-0 bg-surface">
              Module
            </th>
            {actions.map((action) => (
              <th
                key={action}
                className="text-center py-2 px-2 text-xs font-semibold text-mid uppercase tracking-wide whitespace-nowrap"
              >
                {titleCaseAction(action)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => {
            const byAction = new Map(module.permissions.map((p) => [p.action, p]));
            return (
              <tr key={module.key} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3 sticky left-0 bg-surface">
                  <span className="text-sm font-medium text-ink">{module.label}</span>
                </td>
                {actions.map((action) => {
                  const permission = byAction.get(action);
                  if (!permission) {
                    return <td key={action} className="text-center py-2.5 px-2 text-mist">-</td>;
                  }
                  return (
                    <td key={action} className="text-center py-2.5 px-2">
                      <Checkbox
                        checked={selected.has(permission.key)}
                        disabled={locked}
                        onChange={() => onToggle(permission.key)}
                        aria-label={`${module.label} ${titleCaseAction(action)}`}
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
  );
}
