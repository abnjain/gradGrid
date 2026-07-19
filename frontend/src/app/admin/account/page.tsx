"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { UserCircle, Lock, Globe } from "lucide-react";

export default function AdminAccountPage() {
  return (
    <ModuleHub
      title="My Account"
      description="Manage your profile, password, and active sessions."
      features={[
        { title: "My Profile", href: "/admin/account/profile", icon: UserCircle, description: "View and edit your profile information.", color: "brand" },
        { title: "Change Password", href: "/admin/account/change-password", icon: Lock, description: "Update your account password.", color: "info" },
        { title: "Active Sessions", href: "/admin/account/sessions", icon: Globe, description: "View and manage active login sessions.", color: "amber" },
      ]}
    />
  );
}
