"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function RolesPermissionsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Roles & Permissions"
      description="Configure user roles, permissions, and access controls."
    />
  );
}
