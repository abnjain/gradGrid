"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { School, Plus, Building2, Calendar, Users, Flag, ShieldAlert } from "lucide-react";

export default function AdminInstitutionsPage() {
  return (
    <ModuleHub
      title="Institutions"
      description="Manage all institutions across the platform."
      features={[
        { title: "All Institutions", href: "/platform/institutions/list", icon: School, description: "View and search all registered institutions.", color: "brand" },
        { title: "Create Institution", href: "/platform/institutions/new", icon: Plus, description: "Provision a new institution on the platform.", color: "brand" },
        { title: "Academic Sessions", href: "/platform/institutions/sessions", icon: Calendar, description: "Manage academic sessions for institutions.", color: "info" },
        { title: "Feature Flags", href: "/platform/institutions/features", icon: Flag, description: "Toggle feature availability per institution.", color: "amber" },
        { title: "Audit Trail", href: "/platform/institutions/audit", icon: ShieldAlert, description: "View institution-level audit events.", color: "danger" },
      ]}
    />
  );
}
