"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function Page() {
  return <EmptyState icon={<Construction className="w-12 h-12" />} title="Feature Flags" description="Toggle platform features on/off for testing and rollout." />;
}
