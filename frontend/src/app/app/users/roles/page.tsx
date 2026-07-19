"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function RolesPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Roles"
      description="View and manage user roles and their permissions."
    />
  );
}
