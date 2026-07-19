"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { Settings, Shield, MessageSquare, Database, Building2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <ModuleHub
      title="Settings"
      description="Manage institution settings and configuration."
      features={[
        { title: "General", href: "/app/settings/general", icon: Building2, description: "Institution name, address, contact details.", color: "brand" },
        { title: "Branding", href: "/app/settings/branding", icon: Settings, description: "Logo, colors, and institution branding.", color: "brand" },
        { title: "Roles & Permissions", href: "/app/settings/roles", icon: Shield, description: "View and manage roles and permissions.", color: "violet" },
        { title: "Communication", href: "/app/settings/communication", icon: MessageSquare, description: "Email and WhatsApp configuration.", color: "info" },
        { title: "Data Management", href: "/app/settings/data", icon: Database, description: "Data retention and export settings.", color: "amber", comingSoon: true },
      ]}
    />
  );
}
