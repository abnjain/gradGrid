"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { FileText, FileCheck } from "lucide-react";

export default function DocumentsPage() {
  return (
    <ModuleHub
      title="Documents"
      description="Manage document templates and generated documents."
      features={[
        { title: "Templates", href: "/app/documents/templates", icon: FileText, description: "Manage ID cards, admit cards, report cards, and certificates.", color: "amber" },
        { title: "Generated Documents", href: "/app/documents/generated", icon: FileCheck, description: "View and re-download previously generated documents.", color: "success" },
      ]}
    />
  );
}
