"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { Users, UserPlus, Shield, UserCog } from "lucide-react";

export default function UsersPage() {
  return (
    <ModuleHub
      title="Users"
      description="Manage staff accounts and role-based access."
      features={[
        { title: "All Users", href: "/app/users/list", icon: Users, description: "View all staff with GradGrid platform access.", color: "violet" },
        { title: "Invite User", href: "/app/users/invite", icon: UserPlus, description: "Invite a new staff member to the platform.", color: "violet" },
        { title: "Roles & Permissions", href: "/app/users/roles", icon: Shield, description: "Manage roles and permission assignments.", color: "brand" },
        { title: "My Account", href: "/app/users/profile", icon: UserCog, description: "View your profile and active sessions.", color: "info" },
      ]}
    />
  );
}
