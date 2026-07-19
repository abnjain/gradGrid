"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { BarChart3, Users, GraduationCap, DollarSign, ClipboardCheck, FileSpreadsheet, Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <ModuleHub
      title="Reports"
      description="Generate and view institutional reports."
      features={[
        { title: "Attendance Reports", href: "/app/reports/attendance", icon: ClipboardCheck, description: "Class and student attendance summaries.", color: "success" },
        { title: "Admission Reports", href: "/app/reports/admissions", icon: Users, description: "Admission trends and enrollment reports.", color: "brand" },
        { title: "Student Reports", href: "/app/reports/students", icon: GraduationCap, description: "Student demographic and performance reports.", color: "info" },
        { title: "Teacher Reports", href: "/app/reports/teachers", icon: Users, description: "Teacher-related reports.", color: "violet" },
        { title: "Fee Reports", href: "/app/reports/fees", icon: DollarSign, description: "Collection summaries and outstanding reports.", color: "amber" },
        { title: "Salary Reports", href: "/app/reports/salary", icon: DollarSign, description: "Monthly salary summaries.", color: "info" },
        { title: "Examination Reports", href: "/app/reports/examination", icon: FileSpreadsheet, description: "Exam result summaries and analysis.", color: "violet" },
        { title: "Export Centre", href: "/app/reports/export", icon: Download, description: "Export all reports in one place.", color: "brand" },
      ]}
    />
  );
}
