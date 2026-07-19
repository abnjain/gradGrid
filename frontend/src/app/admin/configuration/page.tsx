"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { Settings, Flag, Mail, Globe } from "lucide-react";

export default function AdminConfigurationPage() {
  return (
    <ModuleHub
      title="Configuration"
      description="Manage system-wide settings, feature flags, and email configuration."
      features={[
        { title: "System Configuration", href: "/admin/configuration/system", icon: Settings, description: "Core platform configuration settings.", color: "brand" },
        { title: "Feature Flags", href: "/admin/configuration/feature-flags", icon: Flag, description: "Toggle global and per-institution features.", color: "amber" },
        { title: "Email Configuration", href: "/admin/configuration/email", icon: Mail, description: "Configure email providers and templates.", color: "info" },
        { title: "Environment", href: "/admin/configuration/environment", icon: Globe, description: "View environment settings and variables.", color: "violet" },
      ]}
    />
  );
}
