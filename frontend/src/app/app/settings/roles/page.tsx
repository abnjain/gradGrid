"use client";

import React from "react";
import { SettingsPageLayout } from "@/components/shared/settings-page-layout";
import { RolesPermissionsEditor } from "@/components/rbac/roles-permissions-editor";
import { usePermissions } from "@/lib/use-permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RolesPermissionsPage() {
  const { can, loaded } = usePermissions();
  const canView = can("roles.view");

  if (loaded && !canView) {
    return (
      <SettingsPageLayout title="Roles & Permissions" description="View and manage roles and permissions.">
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-mid mb-4">You do not have permission to view roles.</p>
          <Button variant="secondary">
            <Link href="/app/settings" className="no-underline text-inherit">
              Back to settings
            </Link>
          </Button>
        </div>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Roles & Permissions"
      description="Configure institution roles and their module permissions."
    >
      <RolesPermissionsEditor
        title="Institution roles"
        description="System roles follow the GradGrid permission matrix. Custom roles can be added for your campus."
        permissionsPath="/permissions"
        rolesPath="/roles"
        canCreate={can("roles.create")}
        canUpdate={can("roles.update")}
        canDelete={can("roles.delete")}
      />
    </SettingsPageLayout>
  );
}
