"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function Page() {
  return <EmptyState icon={<Construction className="w-12 h-12" />} title="User Access Log" description="View detailed access history for this user." />;
}
