"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { UserPlus, Download, Upload, Users } from "lucide-react";

export default function StudentsPage() {
  return (
    <ModuleHub
      title="Students"
      description="Manage student records, profiles, and enrollment."
      features={[
        { title: "All Students", href: "/app/students/list", icon: Users, description: "View, search, and manage all student records.", color: "brand" },
        { title: "Add Student", href: "/app/students/new", icon: UserPlus, description: "Enroll a new student with personal and academic details.", color: "brand" },
        { title: "Import Students", href: "/app/students/import", icon: Upload, description: "Bulk import students from a spreadsheet template.", color: "info" },
        { title: "Export Students", href: "/app/students/export", icon: Download, description: "Export student data to Excel or CSV.", color: "success" },
      ]}
    />
  );
}
