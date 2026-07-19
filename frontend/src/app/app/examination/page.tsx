"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { FileSpreadsheet, PenSquare, Upload, FileText, Award, FileCheck } from "lucide-react";

export default function ExaminationPage() {
  return (
    <ModuleHub
      title="Examination"
      description="Manage exams, marks, results, and report cards."
      features={[
        { title: "Exam Configuration", href: "/app/examination/config", icon: FileSpreadsheet, description: "Configure exam types, grade rules, and max marks.", color: "violet" },
        { title: "Marks Entry", href: "/app/examination/marks", icon: PenSquare, description: "Enter marks for exams by class and subject.", color: "violet" },
        { title: "Import Marks", href: "/app/examination/marks/import", icon: Upload, description: "Bulk import marks from Excel.", color: "info" },
        { title: "Results", href: "/app/examination/results", icon: Award, description: "View class-wise and student-wise results.", color: "brand" },
        { title: "Admit Cards", href: "/app/examination/admit-cards", icon: FileText, description: "Generate and download admit cards.", color: "amber" },
        { title: "Report Cards", href: "/app/examination/report-cards", icon: FileCheck, description: "Generate and download report cards.", color: "success" },
      ]}
    />
  );
}
