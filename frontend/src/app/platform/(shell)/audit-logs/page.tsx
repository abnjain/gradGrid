"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { ShieldAlert, Download } from "lucide-react";

export default function AdminAuditLogsPage() {
  return (
    <ModuleHub
      title="Audit Logs"
      description="View platform-wide audit trails and security events."
      features={[
        { title: "Log Stream", href: "/platform/audit-logs/stream", icon: ShieldAlert, description: "View all platform audit events with filters.", color: "danger" },
        { title: "Export Logs", href: "/platform/audit-logs/export", icon: Download, description: "Export audit logs for compliance.", color: "info" },
      ]}
    />
  );
}
