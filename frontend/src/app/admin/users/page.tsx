"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { Users, UserPlus, UserCog, Shield, History } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <ModuleHub
      title="Platform Users"
      description="Manage platform administrators and support staff."
      features={[
        { title: "All Users", href: "/admin/users/list", icon: Users, description: "View all platform users.", color: "violet" },
        { title: "Invite User", href: "/admin/users/invite", icon: UserPlus, description: "Invite a new platform user.", color: "violet" },
        { title: "User Profile", href: "/admin/users/profile", icon: UserCog, description: "View user details and role assignments.", color: "brand" },
        { title: "Roles", href: "/admin/users/roles", icon: Shield, description: "Manage platform roles and permissions.", color: "info" },
        { title: "Access Logs", href: "/admin/users/access-logs", icon: History, description: "View user access history.", color: "amber" },
      ]}
    />
  );
}
