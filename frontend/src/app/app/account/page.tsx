"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { UserCircle, Lock, Globe } from "lucide-react";

export default function AccountPage() {
  return (
    <ModuleHub
      title="My Account"
      description="Manage your profile, password, and active sessions."
      features={[
        { title: "My Profile", href: "/app/account/profile", icon: UserCircle, description: "View and edit your profile information.", color: "brand" },
        { title: "Change Password", href: "/app/account/change-password", icon: Lock, description: "Update your account password.", color: "info" },
        { title: "Active Sessions", href: "/app/account/sessions", icon: Globe, description: "View and manage active login sessions.", color: "amber" },
      ]}
    />
  );
}
