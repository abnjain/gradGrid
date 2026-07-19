"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { UserPlus, ClipboardList, FileBarChart, GitFork } from "lucide-react";

export default function AdmissionsPage() {
  return (
    <ModuleHub
      title="Admissions"
      description="Manage student admissions and enrollment pipeline."
      features={[
        { title: "Enquiry Pipeline", href: "/app/admissions/pipeline", icon: GitFork, description: "Kanban and list view of admission enquiries.", color: "brand" },
        { title: "New Enquiry", href: "/app/admissions/new", icon: UserPlus, description: "Register a new admission enquiry.", color: "brand" },
        { title: "Convert to Student", href: "/app/admissions/convert", icon: ClipboardList, description: "Convert an enquiry into a student record.", color: "success" },
        { title: "Admission Reports", href: "/app/admissions/reports", icon: FileBarChart, description: "View and export admission reports.", color: "info" },
      ]}
    />
  );
}
