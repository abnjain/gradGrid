"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { BookOpen, Layers, BookMarked, Building2, Home, Calendar } from "lucide-react";

export default function AcademicsPage() {
  return (
    <ModuleHub
      title="Academic Structure"
      description="Manage classes, subjects, departments, and academic sessions."
      features={[
        { title: "Academic Sessions", href: "/app/academics/sessions", icon: Calendar, description: "Manage academic sessions and set active session.", color: "brand" },
        { title: "Classes & Sections", href: "/app/academics/classes", icon: Layers, description: "Create and manage classes and sections.", color: "brand" },
        { title: "Subjects", href: "/app/academics/subjects", icon: BookMarked, description: "Manage subjects and assign to classes.", color: "info" },
        { title: "Departments", href: "/app/academics/departments", icon: Building2, description: "Manage academic departments.", color: "violet" },
        { title: "Houses", href: "/app/academics/houses", icon: Home, description: "Manage student houses (optional).", color: "amber" },
      ]}
    />
  );
}
