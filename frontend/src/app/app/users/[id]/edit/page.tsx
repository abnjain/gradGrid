"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function EditUserPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Edit User"
      description="Update user information and permissions."
    />
  );
}
