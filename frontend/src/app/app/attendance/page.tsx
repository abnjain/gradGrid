"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { ClipboardCheck, ClipboardList, Users, BarChart3 } from "lucide-react";

export default function AttendancePage() {
  return (
    <ModuleHub
      title="Attendance"
      description="Track and manage student and staff attendance."
      features={[
        { title: "Mark Attendance", href: "/app/attendance/mark", icon: ClipboardCheck, description: "Mark daily student attendance by class and section.", color: "success" },
        { title: "Attendance Register", href: "/app/attendance/register", icon: ClipboardList, description: "View monthly attendance registers.", color: "success" },
        { title: "Teacher Attendance", href: "/app/attendance/teachers", icon: Users, description: "Mark and manage teacher attendance.", color: "brand" },
        { title: "Attendance Reports", href: "/app/attendance/reports", icon: BarChart3, description: "Generate and export attendance reports.", color: "info" },
      ]}
    />
  );
}
