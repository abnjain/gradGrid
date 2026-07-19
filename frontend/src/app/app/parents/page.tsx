"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { Users, Download, UserCircle } from "lucide-react";

export default function ParentsPage() {
  return (
    <ModuleHub
      title="Parents"
      description="Manage parent and guardian records."
      features={[
        { title: "All Parents", href: "/app/parents/list", icon: Users, description: "View and search parent and guardian records.", color: "amber" },
        { title: "Parent Profile", href: "/app/parents/new", icon: UserCircle, description: "View parent details, linked students, and communication history.", color: "amber" },
        { title: "Export Parents", href: "/app/parents/export", icon: Download, description: "Export parent data to Excel or CSV.", color: "success" },
      ]}
    />
  );
}
