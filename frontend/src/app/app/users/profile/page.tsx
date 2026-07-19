"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function MyProfilePage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="My Profile"
      description="View and edit your profile information and preferences."
    />
  );
}
