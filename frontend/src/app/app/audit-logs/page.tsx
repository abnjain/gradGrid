"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { ShieldAlert, Download } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <ModuleHub
      title="Audit Logs"
      description="View and export system audit trail."
      features={[
        { title: "Log Stream", href: "/app/audit-logs/stream", icon: ShieldAlert, description: "View all audit events with filters and search.", color: "danger" },
        { title: "Export Logs", href: "/app/audit-logs/export", icon: Download, description: "Export audit logs for compliance.", color: "info" },
      ]}
    />
  );
}
