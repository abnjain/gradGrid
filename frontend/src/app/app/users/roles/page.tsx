"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Shield } from "lucide-react";

export default function UsersRolesRedirectPage() {
  const router = useRouter();
  return (
    <EmptyState
      icon={<Shield className="w-12 h-12" />}
      title="Roles & Permissions"
      description="Manage institution roles from Settings."
      action={{
        label: "Open Roles & Permissions",
        onClick: () => router.push("/app/settings/roles"),
      }}
    />
  );
}
