"use client";

import React from "react";
import { RolesPermissionsEditor } from "@/components/rbac/roles-permissions-editor";
import { usePermissions } from "@/lib/use-permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PlatformRolesPage() {
  const { can, loaded } = usePermissions();
  const canView = can("roles.view");

  if (loaded && !canView) {
    return (
      <div className="max-w-3xl rounded-xl border border-border bg-surface p-8 text-center">
        <h1 className="text-xl font-bold font-display text-ink mb-2">Platform Roles</h1>
        <p className="text-sm text-mid mb-4">You do not have permission to view platform roles.</p>
        <Button variant="secondary">
          <Link href="/admin/users" className="no-underline text-inherit">
            Back to platform users
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Link
          href="/admin/users"
          className="text-sm text-mid hover:text-charcoal no-underline"
        >
          Back to Platform Users
        </Link>
        <h1 className="text-xl font-bold font-display text-ink mt-2">Platform Roles</h1>
        <p className="text-sm text-mid mt-0.5">
          Manage platform-level roles and their permissions for GradGrid staff.
        </p>
      </div>
      <RolesPermissionsEditor
        title="Platform roles"
        description="Super admin permissions are locked. Other platform roles can be customized."
        permissionsPath="/platform/permissions"
        rolesPath="/platform/roles"
        canCreate={can("roles.create")}
        canUpdate={can("roles.update")}
        canDelete={can("roles.delete")}
      />
    </div>
  );
}
