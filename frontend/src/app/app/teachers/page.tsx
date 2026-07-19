"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { Users, UserPlus, Upload, Download, DollarSign } from "lucide-react";

export default function TeachersPage() {
  return (
    <ModuleHub
      title="Teachers"
      description="Manage teacher profiles, assignments, and payroll."
      features={[
        { title: "All Teachers", href: "/app/teachers/list", icon: Users, description: "View, search, and manage all teacher records.", color: "info" },
        { title: "Add Teacher", href: "/app/teachers/new", icon: UserPlus, description: "Add a new teacher with employment details.", color: "info" },
        { title: "Import Teachers", href: "/app/teachers/import", icon: Upload, description: "Bulk import teachers from a spreadsheet.", color: "brand" },
        { title: "Export Teachers", href: "/app/teachers/export", icon: Download, description: "Export teacher data to Excel or CSV.", color: "success" },
        { title: "Salary", href: "/app/teachers/salary", icon: DollarSign, description: "Manage teacher salary and payroll.", color: "amber", comingSoon: true },
      ]}
    />
  );
}
