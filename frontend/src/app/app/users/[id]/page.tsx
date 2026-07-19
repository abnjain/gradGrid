"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function UserDetailsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="User Details"
      description="View complete user information and activity."
    />
  );
}
