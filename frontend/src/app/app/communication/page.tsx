"use client";

import React from "react";
import { ModuleHub } from "@/components/shared/module-hub";
import { MessageSquare, Send, History, FileText, Settings } from "lucide-react";

export default function CommunicationPage() {
  return (
    <ModuleHub
      title="Communication"
      description="Send messages, manage templates, and view history."
      features={[
        { title: "Compose Message", href: "/app/communication/compose", icon: Send, description: "Send emails or WhatsApp messages to parents and staff.", color: "brand" },
        { title: "Message History", href: "/app/communication/history", icon: History, description: "View sent messages and delivery status.", color: "brand" },
        { title: "Templates", href: "/app/communication/templates", icon: FileText, description: "Manage message templates.", color: "info" },
        { title: "Settings", href: "/app/communication/settings", icon: Settings, description: "Configure email and WhatsApp integration.", color: "amber" },
      ]}
    />
  );
}
