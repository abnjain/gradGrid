"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { Building2, Plus, School, CreditCard, ShieldAlert } from "lucide-react";

export default function AdminOrganizationsPage() {
  return (
    <ModuleHub
      title="Organizations"
      description="Manage organizations and their subscriptions."
      features={[
        { title: "All Organizations", href: "/admin/organizations/list", icon: Building2, description: "View and search all organizations.", color: "brand" },
        { title: "Create Organization", href: "/admin/organizations/new", icon: Plus, description: "Create a new organization.", color: "brand" },
        { title: "Subscription & Licensing", href: "/admin/organizations/subscriptions", icon: CreditCard, description: "Manage plans and subscriptions.", color: "amber", comingSoon: true },
        { title: "Audit Trail", href: "/admin/organizations/audit", icon: ShieldAlert, description: "View organization-level audit events.", color: "danger" },
      ]}
    />
  );
}
