"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function CommunicationSettingsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Communication Settings"
      description="Configure email, SMS, and notification settings."
    />
  );
}
